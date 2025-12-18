import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationPDF } from "@/lib/services/registration-pdf-generator";
import { findOrCreateClientFolder, uploadToFolder, uploadMultipleFiles } from "@/lib/services/google-drive";
import { sendRegistrationEmailToClient, sendRegistrationEmailToAdmin } from "@/lib/services/email";
import { markRegistrationSubmitted } from "@/lib/db/folder-mappings";
import { ApplicantInfo, SpouseInfo, ChildInfo } from "@/stores/registrationFormStore";
import { verifySubmissionToken } from "@/lib/db/registrations";

export async function POST(req: NextRequest) {
  try {
    console.log("📝 Registration submission received");

    // Parse form data
    const formData = await req.formData();

    // Extract JSON data
    const applicantInfo: ApplicantInfo = JSON.parse(formData.get("applicantInfo") as string);
    const maritalStatus = formData.get("maritalStatus") as string;
    const spouseInfo: SpouseInfo | null = formData.get("spouseInfo")
      ? JSON.parse(formData.get("spouseInfo") as string)
      : null;
    const children: ChildInfo[] = formData.get("children")
      ? JSON.parse(formData.get("children") as string)
      : [];
    const submissionToken = formData.get("submissionToken") as string;

    console.log(`📋 Processing registration for: ${applicantInfo.firstName} ${applicantInfo.lastName}`);
    console.log(`   Email: ${applicantInfo.email}`);
    console.log(`   Marital Status: ${maritalStatus}`);
    console.log(`   Children: ${children.length}`);

    // Validate required fields
    if (!applicantInfo.firstName || !applicantInfo.lastName || !applicantInfo.email || !applicantInfo.phone) {
      return NextResponse.json(
        { error: "Missing required applicant information" },
        { status: 400 }
      );
    }

    // 🔒 SECURITY CHECK 1: Verify submission token (prevent double submission)
    if (!submissionToken) {
      console.error("❌ Missing submission token");
      return NextResponse.json(
        { error: "Invalid submission. Please refresh and try again." },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Verify token (this also checks for duplicate submissions)
    // verifySubmissionToken will:
    // 1. Check if token exists and matches email/phone
    // 2. Check if token is not already used (!r.used)
    // 3. Mark token as used (r.used = true) to prevent reuse
    const isValidToken = await verifySubmissionToken(submissionToken, applicantInfo.email, applicantInfo.phone);
    if (!isValidToken) {
      console.error("❌ Invalid or already used submission token");
      return NextResponse.json(
        { error: "This form has already been submitted or the submission token is invalid." },
        { status: 409 } // Conflict
      );
    }

    // Generate registration ID
    const timestamp = Date.now();
    const registrationId = `REG-${new Date().toISOString().split('T')[0]}-${timestamp.toString().slice(-6)}`;
    console.log(`🆔 Registration ID: ${registrationId}`);

    // Collect uploaded document info for PDF
    const documentsUploaded = {
      applicant: [] as string[],
      spouse: [] as string[],
      children: {} as { [key: string]: string[] },
    };

    // Track applicant documents
    if (formData.get("applicant_photo")) documentsUploaded.applicant.push("Passport Photo");
    if (formData.get("applicant_passport")) documentsUploaded.applicant.push("Passport Copy");
    if (formData.get("applicant_education")) documentsUploaded.applicant.push("Education Certificate");

    // Track spouse documents
    if (maritalStatus === "married") {
      if (formData.get("spouse_photo")) documentsUploaded.spouse.push("Passport Photo");
      if (formData.get("spouse_passport")) documentsUploaded.spouse.push("Passport Copy");
      if (formData.get("spouse_education")) documentsUploaded.spouse.push("Education Certificate");
      if (formData.get("spouse_marriage_cert")) documentsUploaded.spouse.push("Marriage Certificate");
    }

    // Track children documents
    children.forEach((child) => {
      if (!child.isUSCitizenOrLPR) {
        const childDocs: string[] = [];
        if (formData.get(`child_${child.id}_photo`)) childDocs.push("Passport Photo");
        if (formData.get(`child_${child.id}_passport`)) childDocs.push("Passport Copy");
        if (formData.get(`child_${child.id}_birth_cert`)) childDocs.push("Birth Certificate");
        documentsUploaded.children[child.id] = childDocs;
      }
    });

    // 1. Generate Registration PDF
    console.log("📄 Generating registration PDF...");
    const registrationPdfBuffer = await generateRegistrationPDF({
      registrationId,
      submittedAt: new Date().toLocaleString(),
      applicantInfo,
      maritalStatus,
      spouseInfo,
      children,
      documentsUploaded,
    });

    console.log(`✅ Registration PDF generated (${registrationPdfBuffer.length} bytes)`);

    // 2. Find or Create Google Drive Folder
    console.log("📁 Finding or creating Google Drive folder...");
    const { folderId, folderLink, isExisting } = await findOrCreateClientFolder(
      applicantInfo.firstName,
      applicantInfo.lastName,
      applicantInfo.email,
      applicantInfo.phone
    );

    console.log(`📁 ${isExisting ? "Using existing" : "Created new"} folder: ${folderId}`);
    console.log(`📁 Folder link: ${folderLink}`);

    // 3. Upload Registration PDF to folder
    console.log("📤 Uploading registration PDF to Google Drive...");
    const registrationPdfFilename = `Registration_${applicantInfo.firstName}_${applicantInfo.lastName}_${timestamp}.pdf`;
    await uploadToFolder(folderId, registrationPdfFilename, registrationPdfBuffer, "application/pdf");
    console.log(`✅ Registration PDF uploaded: ${registrationPdfFilename}`);

    // 4. Upload all document files to folder
    console.log("📤 Uploading document files to Google Drive...");
    const filesToUpload: { name: string; buffer: Buffer; mimeType: string }[] = [];

    // Applicant documents
    const applicantPhoto = formData.get("applicant_photo") as File | null;
    if (applicantPhoto) {
      filesToUpload.push({
        name: `Applicant_Photo_${timestamp}.${applicantPhoto.name.split('.').pop()}`,
        buffer: Buffer.from(await applicantPhoto.arrayBuffer()),
        mimeType: applicantPhoto.type,
      });
    }

    const applicantPassport = formData.get("applicant_passport") as File | null;
    if (applicantPassport) {
      filesToUpload.push({
        name: `Applicant_Passport_${timestamp}.${applicantPassport.name.split('.').pop()}`,
        buffer: Buffer.from(await applicantPassport.arrayBuffer()),
        mimeType: applicantPassport.type,
      });
    }

    const applicantEducation = formData.get("applicant_education") as File | null;
    if (applicantEducation) {
      filesToUpload.push({
        name: `Applicant_Education_${timestamp}.${applicantEducation.name.split('.').pop()}`,
        buffer: Buffer.from(await applicantEducation.arrayBuffer()),
        mimeType: applicantEducation.type,
      });
    }

    // Spouse documents (if married)
    if (maritalStatus === "married") {
      const spousePhoto = formData.get("spouse_photo") as File | null;
      if (spousePhoto) {
        filesToUpload.push({
          name: `Spouse_Photo_${timestamp}.${spousePhoto.name.split('.').pop()}`,
          buffer: Buffer.from(await spousePhoto.arrayBuffer()),
          mimeType: spousePhoto.type,
        });
      }

      const spousePassport = formData.get("spouse_passport") as File | null;
      if (spousePassport) {
        filesToUpload.push({
          name: `Spouse_Passport_${timestamp}.${spousePassport.name.split('.').pop()}`,
          buffer: Buffer.from(await spousePassport.arrayBuffer()),
          mimeType: spousePassport.type,
        });
      }

      const spouseEducation = formData.get("spouse_education") as File | null;
      if (spouseEducation) {
        filesToUpload.push({
          name: `Spouse_Education_${timestamp}.${spouseEducation.name.split('.').pop()}`,
          buffer: Buffer.from(await spouseEducation.arrayBuffer()),
          mimeType: spouseEducation.type,
        });
      }

      const marriageCert = formData.get("spouse_marriage_cert") as File | null;
      if (marriageCert) {
        filesToUpload.push({
          name: `Marriage_Certificate_${timestamp}.${marriageCert.name.split('.').pop()}`,
          buffer: Buffer.from(await marriageCert.arrayBuffer()),
          mimeType: marriageCert.type,
        });
      }
    }

    // Children documents
    for (const child of children) {
      if (!child.isUSCitizenOrLPR) {
        const childPhoto = formData.get(`child_${child.id}_photo`) as File | null;
        if (childPhoto) {
          filesToUpload.push({
            name: `Child_${child.fullName.replace(/\s+/g, '_')}_Photo_${timestamp}.${childPhoto.name.split('.').pop()}`,
            buffer: Buffer.from(await childPhoto.arrayBuffer()),
            mimeType: childPhoto.type,
          });
        }

        const childPassport = formData.get(`child_${child.id}_passport`) as File | null;
        if (childPassport) {
          filesToUpload.push({
            name: `Child_${child.fullName.replace(/\s+/g, '_')}_Passport_${timestamp}.${childPassport.name.split('.').pop()}`,
            buffer: Buffer.from(await childPassport.arrayBuffer()),
            mimeType: childPassport.type,
          });
        }

        const childBirthCert = formData.get(`child_${child.id}_birth_cert`) as File | null;
        if (childBirthCert) {
          filesToUpload.push({
            name: `Child_${child.fullName.replace(/\s+/g, '_')}_BirthCert_${timestamp}.${childBirthCert.name.split('.').pop()}`,
            buffer: Buffer.from(await childBirthCert.arrayBuffer()),
            mimeType: childBirthCert.type,
          });
        }
      }
    }

    // Upload all files
    if (filesToUpload.length > 0) {
      await uploadMultipleFiles(folderId, filesToUpload);
      console.log(`✅ Uploaded ${filesToUpload.length} document files`);
    }

    // 5. Mark registration as submitted in database
    await markRegistrationSubmitted(applicantInfo.email);

    // 6. Send confirmation emails
    console.log("📧 Sending confirmation emails...");

    // Email to client (PDF attached, no Drive link)
    await sendRegistrationEmailToClient({
      to: applicantInfo.email,
      firstName: applicantInfo.firstName,
      lastName: applicantInfo.lastName,
      registrationId,
      registrationPdf: registrationPdfBuffer,
    });

    // Email to admin (PDF attached + Drive link)
    await sendRegistrationEmailToAdmin({
      to: applicantInfo.email, // Just for reference in email
      firstName: applicantInfo.firstName,
      lastName: applicantInfo.lastName,
      registrationId,
      registrationPdf: registrationPdfBuffer,
      driveLink: folderLink,
    });

    console.log("✅ Registration submission completed successfully!");

    return NextResponse.json({
      success: true,
      registrationId,
      folderLink: folderLink,
      message: "Registration submitted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error processing registration submission:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to submit registration",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
