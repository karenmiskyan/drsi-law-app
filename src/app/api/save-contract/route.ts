import { NextRequest, NextResponse } from "next/server";
import { generateContractPDF } from "@/lib/services/pdf-generator";
import { sendContractEmail } from "@/lib/services/email";
import { ContactInfo, MaritalStatus } from "@/stores/registrationStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contactInfo,
      maritalStatus,
      signature,
      amount,
    }: {
      contactInfo: ContactInfo;
      maritalStatus: MaritalStatus;
      signature: string;
      amount: number;
    } = body;

    console.log("Saving contract for:", contactInfo.firstName, contactInfo.lastName);

    // Validate required fields
    if (!contactInfo || !maritalStatus || !signature || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Generate Contract PDF
    const contractData = {
      firstName: contactInfo.firstName,
      lastName: contactInfo.lastName,
      email: contactInfo.email,
      phone: contactInfo.phone,
      maritalStatus,
      amount: amount.toString(),
      signature,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    const pdfBuffer = await generateContractPDF(contractData);
    console.log("✅ Contract PDF generated (pre-payment)");
    console.log("📄 PDF Buffer size:", pdfBuffer.length, "bytes");

    // Note: Google Drive upload will happen AFTER payment via Stripe webhook
    console.log("⏳ Drive upload will occur after payment confirmation");

    // 2. Send Email with contract details (without Drive link)
    try {
      await sendContractEmail({
        to: contactInfo.email,
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        amount: amount.toString(),
        // No driveLink yet - will be sent in welcome email after payment
      });
      console.log("✅ Contract email sent to:", contactInfo.email);
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Contract saved successfully. Upload will occur after payment.",
    });
  } catch (error) {
    console.error("Error saving contract:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      {
        error: "Failed to save contract",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

