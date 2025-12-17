import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

interface RegistrationEmailData {
  // Customer info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Registration details
  registrationId: string;
  submissionDate: string;
  maritalStatus: string;
  numberOfChildren: number;
  
  // Links
  driveFolderLink: string;
  registrationPdfLink: string;
}

/**
 * Get base64 encoded logo for email
 */
function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "drsi-logo.png");
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoData.toString("base64")}`;
    }
  } catch (error) {
    console.warn("Logo not found for email");
  }
  return "";
}

/**
 * Send confirmation email to customer
 */
export async function sendRegistrationConfirmationEmail(
  data: RegistrationEmailData
): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Email credentials not configured");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const logoBase64 = getLogoBase64();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - DRSI Law</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #B02828 0%, #8B1F1F 100%); padding: 40px 20px; text-align: center;">
              ${logoBase64 ? `<img src="${logoBase64}" alt="DRSI Law" style="max-width: 150px; height: auto; margin-bottom: 20px;">` : ''}
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Registration Confirmed! ✅
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                Your DV Lottery Application Has Been Received
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>${data.firstName} ${data.lastName}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for completing your Diversity Visa Lottery registration with DRSI Law! 
                We have successfully received your application and all supporting documents.
              </p>
              
              <!-- Registration Details Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #B02828; font-size: 18px;">
                      📋 Registration Details
                    </h3>
                    <table cellpadding="5" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 14px; color: #666; width: 40%;">Registration ID:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.registrationId}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666;">Submission Date:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.submissionDate}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666;">Marital Status:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.maritalStatus.charAt(0).toUpperCase() + data.maritalStatus.slice(1)}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666;">Children (under 21):</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.numberOfChildren}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Next Steps -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #B02828; font-size: 18px;">
                  📌 What Happens Next?
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 10px;">
                    <strong>Document Review:</strong> Our team will review your application and documents within 2-3 business days.
                  </li>
                  <li style="margin-bottom: 10px;">
                    <strong>Quality Check:</strong> We will verify all information and ensure compliance with DV Lottery requirements.
                  </li>
                  <li style="margin-bottom: 10px;">
                    <strong>Official Submission:</strong> Once approved, we will submit your application to the US Department of State.
                  </li>
                  <li style="margin-bottom: 10px;">
                    <strong>Confirmation:</strong> You will receive a confirmation email with your official case number.
                  </li>
                </ol>
              </div>
              
              <!-- Document Access -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 16px;">
                      📁 Your Documents
                    </h3>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #555; line-height: 1.6;">
                      All your documents have been securely stored in Google Drive. You can access them anytime using the link below:
                    </p>
                    <a href="${data.driveFolderLink}" 
                       style="display: inline-block; background-color: #4caf50; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-size: 14px; font-weight: bold; margin-top: 10px;">
                      📂 View My Documents
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Important Notice -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; color: #e65100; font-size: 16px;">
                      ⚠️ Important Reminders
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555; line-height: 1.8;">
                      <li>Keep your registration ID safe for future reference</li>
                      <li>Check your email regularly for updates</li>
                      <li>Contact us immediately if you need to update any information</li>
                      <li>Do not submit duplicate applications</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- Support -->
              <div style="margin: 30px 0; text-align: center;">
                <p style="font-size: 14px; color: #666; margin: 0 0 15px 0;">
                  Questions? We're here to help!
                </p>
                <a href="mailto:office@drsi-law.com" 
                   style="display: inline-block; background-color: #B02828; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-size: 14px; font-weight: bold; margin: 5px;">
                  📧 Email Support
                </a>
                <a href="https://wa.me/972587644252" 
                   target="_blank"
                   style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-size: 14px; font-weight: bold; margin: 5px;">
                  💬 WhatsApp
                </a>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                <strong>DRSI Law - Immigration Services</strong>
              </p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #999; line-height: 1.6;">
                Professional assistance for Diversity Visa Lottery applications<br>
                Helping families achieve their American Dream since 2010
              </p>
              <p style="margin: 15px 0 0 0; font-size: 11px; color: #999;">
                © ${new Date().getFullYear()} DRSI Law. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"DRSI Law" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `✅ Registration Confirmed - ${data.registrationId}`,
      html: htmlContent,
    });

    console.log(`✅ Customer confirmation email sent to: ${data.email}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send customer email:", error);
    return false;
  }
}

/**
 * Send notification email to admin
 */
export async function sendAdminNotificationEmail(
  data: RegistrationEmailData
): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Email credentials not configured");
      return false;
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const logoBase64 = getLogoBase64();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Registration - DRSI Law Admin</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); padding: 40px 20px; text-align: center;">
              ${logoBase64 ? `<img src="${logoBase64}" alt="DRSI Law" style="max-width: 150px; height: auto; margin-bottom: 20px;">` : ''}
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                🆕 New Registration Submitted
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                Admin Notification
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                A new DV Lottery registration has been submitted and requires review.
              </p>
              
              <!-- Client Information -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #1976d2; font-size: 18px;">
                      👤 Client Information
                    </h3>
                    <table cellpadding="5" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 14px; color: #666; width: 40%;">Name:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.firstName} ${data.lastName}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666;">Email:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">
                          <a href="mailto:${data.email}" style="color: #1976d2; text-decoration: none;">${data.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666;">Phone:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">
                          <a href="tel:${data.phone}" style="color: #1976d2; text-decoration: none;">${data.phone}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Registration Details -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #B02828; font-size: 18px;">
                      📋 Registration Details
                    </h3>
                    <table cellpadding="5" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 14px; color: #666; width: 40%;">Registration ID:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.registrationId}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666;">Submission Date:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.submissionDate}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666;">Marital Status:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.maritalStatus.charAt(0).toUpperCase() + data.maritalStatus.slice(1)}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #666;">Number of Children:</td>
                        <td style="font-size: 14px; color: #333; font-weight: bold;">${data.numberOfChildren}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Action Required -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; color: #e65100; font-size: 16px;">
                      ⚡ Action Required
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #555; line-height: 1.8;">
                      <li>Review the registration PDF and all uploaded documents</li>
                      <li>Verify information accuracy and completeness</li>
                      <li>Check for any potential issues or missing documents</li>
                      <li>Contact client if clarification is needed</li>
                      <li>Proceed with official DV Lottery submission when approved</li>
                    </ol>
                  </td>
                </tr>
              </table>
              
              <!-- Quick Actions -->
              <div style="margin: 30px 0; text-align: center;">
                <a href="${data.driveFolderLink}" 
                   style="display: inline-block; background-color: #1976d2; color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 5px; font-size: 15px; font-weight: bold; margin: 5px;">
                  📂 View All Documents
                </a>
                <a href="${data.registrationPdfLink}" 
                   style="display: inline-block; background-color: #B02828; color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 5px; font-size: 15px; font-weight: bold; margin: 5px;">
                  📄 Download Registration PDF
                </a>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                DRSI Law - Admin Panel | ${new Date().getFullYear()}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"DRSI Law System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🆕 New Registration: ${data.firstName} ${data.lastName} - ${data.registrationId}`,
      html: htmlContent,
    });

    console.log(`✅ Admin notification email sent to: ${adminEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send admin email:", error);
    return false;
  }
}

