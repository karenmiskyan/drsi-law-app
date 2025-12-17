import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Helper function to load logo as base64
function getLogoBase64(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "drsi-logo.png");
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoData.toString("base64")}`;
    }
  } catch (error) {
    console.warn("Logo not found for email");
  }
  return null;
}

interface EmailData {
  to: string;
  firstName: string;
  lastName: string;
  registrationFormLink?: string;
  driveLink?: string;
}

interface RegistrationEmailData {
  to: string;
  firstName: string;
  lastName: string;
  registrationId: string;
  registrationPdf?: Buffer;
  driveLink?: string;
}

/**
 * Send contract saved confirmation email
 */
export async function sendContractEmail(data: {
  to: string;
  firstName: string;
  lastName: string;
  driveLink?: string;
  amount: string;
}): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("Email credentials not configured");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "DRSI Law"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: data.to,
      subject: "Contract Saved - DRSI Law Registration",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #B02828 0%, #8B1F1F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #B02828; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B02828; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Contract Saved Successfully!</h1>
            </div>
            <div class="content">
              <h2>Dear ${data.firstName} ${data.lastName},</h2>
              
              <p>Your contract has been signed and saved successfully. We have received your information and created a secure folder for your documents.</p>
              
              <div class="info-box">
                <h3>📋 Contract Details:</h3>
                <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>Email:</strong> ${data.to}</p>
                <p><strong>Total Amount:</strong> $${data.amount}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              ${data.driveLink ? `
              <p><strong>📁 Your Documents:</strong></p>
              <center>
                <a href="${data.driveLink}" class="button">View Your Contract Folder</a>
              </center>
              ` : ''}
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Complete the payment on the next page</li>
                <li>After payment, you'll receive a confirmation email</li>
                <li>We'll send you the registration form link within 24 hours</li>
              </ol>
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>
              <strong>The DRSI Law Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 DRSI Law. All rights reserved.</p>
              <p>This email was sent to ${data.to}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${data.firstName} ${data.lastName},

Your contract has been signed and saved successfully.

Contract Details:
- Name: ${data.firstName} ${data.lastName}
- Email: ${data.to}
- Total Amount: $${data.amount}
- Date: ${new Date().toLocaleDateString()}

${data.driveLink ? `Your Documents Folder: ${data.driveLink}` : ''}

Next Steps:
1. Complete the payment on the next page
2. After payment, you'll receive a confirmation email
3. We'll send you the registration form link within 24 hours

Best regards,
The DRSI Law Team

© 2025 DRSI Law. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Contract email sent to ${data.to}`);
  } catch (error) {
    console.error("Error sending contract email:", error);
    throw new Error("Failed to send contract email");
  }
}

export async function sendWelcomeEmail(data: EmailData): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("Email credentials not configured");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const formLink = data.registrationFormLink || "https://drsi-law.com/registration-form";
    const logoBase64 = getLogoBase64();

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "DRSI Law"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: data.to,
      subject: "Welcome to DRSI Law - Your Immigration Registration",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${logoBase64 ? `<img src="${logoBase64}" alt="DRSI Law" style="max-width: 150px; height: auto; margin-bottom: 20px;">` : ''}
              <h1>Welcome to DRSI Law!</h1>
            </div>
            <div class="content">
              <h2>Dear ${data.firstName} ${data.lastName},</h2>
              
              <p>Thank you for choosing DRSI Law for your immigration lottery registration. We have successfully received your payment and contract.</p>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Complete your detailed registration form</li>
                <li>Upload required documents (passport, photos, etc.)</li>
                <li>Review and submit your application</li>
              </ol>
              
              ${data.driveLink ? `
              <p><strong>📁 Your Documents Folder:</strong></p>
              <center>
                <a href="${data.driveLink}" class="button" style="background: #4CAF50; margin-bottom: 10px;">View Your Contract Folder</a>
              </center>
              ` : ''}
              
              <p>Please click the button below to access your registration form:</p>
              
              <center>
                <a href="${formLink}" class="button">Complete Registration Form</a>
              </center>
              
              <p><strong>Important:</strong> Please complete your registration within 7 days to ensure timely processing.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact us at office@drsi-law.com or via WhatsApp at +972 58-764-4252.</p>
              
              <p>Best regards,<br>
              <strong>The DRSI Law Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 DRSI Law. All rights reserved.</p>
              <p>This email was sent to ${data.to}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${data.firstName} ${data.lastName},

Thank you for choosing DRSI Law for your immigration lottery registration. We have successfully received your payment and contract.

Next Steps:
1. Complete your detailed registration form
2. Upload required documents (passport, photos, etc.)
3. Review and submit your application

Please visit the following link to access your registration form:
${formLink}

Important: Please complete your registration within 7 days to ensure timely processing.

If you have any questions or need assistance, please don't hesitate to contact us at office@drsi-law.com or via WhatsApp at +972 58-764-4252.

Best regards,
The DRSI Law Team

© 2025 DRSI Law. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${data.to}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
}

/**
 * Send registration confirmation email to CLIENT with PDF attachment
 */
export async function sendRegistrationEmailToClient(data: RegistrationEmailData): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("Email credentials not configured");
    return;
  }

  if (!data.registrationPdf) {
    console.warn("No registration PDF provided for client email");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "DRSI Law"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: data.to,
      subject: "Registration Submitted - DRSI Law DV Lottery",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #B02828 0%, #8B1F1F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; margin-bottom: 20px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .warning-box { background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFC107; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Registration Submitted Successfully!</h1>
            </div>
            <div class="content">
              <h2>Dear ${data.firstName} ${data.lastName},</h2>
              
              <p>Congratulations! Your DV Lottery registration has been successfully submitted to DRSI Law.</p>
              
              <div class="info-box">
                <h3>📋 Registration Details:</h3>
                <p><strong>Registration ID:</strong> ${data.registrationId}</p>
                <p><strong>Applicant:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>Email:</strong> ${data.to}</p>
                <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> Submitted ✓</p>
              </div>
              
              <div class="warning-box">
                <h3>📎 Attached Document:</h3>
                <p>Your complete registration form is attached to this email as a PDF document. Please save this file for your records.</p>
              </div>
              
              <h3>What Happens Next:</h3>
              <ol>
                <li><strong>Document Review (24-48 hours):</strong> Our team will carefully review all your submitted information and uploaded documents.</li>
                <li><strong>Quality Check:</strong> We will verify that all requirements are met for the DV Lottery application.</li>
                <li><strong>Government Submission:</strong> Once approved, we will submit your application to the US Department of State.</li>
                <li><strong>Confirmation:</strong> You will receive a final confirmation email with your application tracking number.</li>
              </ol>
              
              <div class="info-box">
                <h3>📧 Important:</h3>
                <ul>
                  <li>Keep this email and the attached PDF for your records</li>
                  <li>Check your email regularly for updates from our team</li>
                  <li>If you have any questions, reply to this email</li>
                  <li>Our team will contact you if additional information is needed</li>
                </ul>
              </div>
              
              <p>Thank you for choosing DRSI Law for your immigration needs. We are committed to providing you with excellent service.</p>
              
              <div class="footer">
                <p><strong>DRSI Law Services</strong></p>
                <p>Immigration & Legal Services</p>
                <p>Email: office@drsi-law.com | WhatsApp: +972 58-764-4252</p>
                <p>© 2025 DRSI Law. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Registration_${data.firstName}_${data.lastName}_${data.registrationId}.pdf`,
          content: data.registrationPdf,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration email sent to client: ${data.to}`);
  } catch (error) {
    console.error("❌ Error sending registration email to client:", error);
    throw new Error("Failed to send registration email to client");
  }
}

/**
 * Send registration notification email to ADMIN with PDF and Drive link
 */
export async function sendRegistrationEmailToAdmin(data: RegistrationEmailData): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("Email credentials not configured");
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  if (!adminEmail) {
    console.warn("No admin email configured");
    return;
  }

  if (!data.registrationPdf) {
    console.warn("No registration PDF provided for admin email");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || "DRSI Law"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `New Registration Submitted - ${data.firstName} ${data.lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .admin-icon { font-size: 48px; margin-bottom: 20px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E3A8A; }
            .button { display: inline-block; background: #B02828; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="admin-icon">🔔</div>
              <h1>New Registration Submitted</h1>
              <p>Admin Notification</p>
            </div>
            <div class="content">
              <h2>Registration Details</h2>
              
              <div class="info-box">
                <h3>Client Information:</h3>
                <p><strong>Registration ID:</strong> ${data.registrationId}</p>
                <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                <p><strong>Email:</strong> ${data.to}</p>
                <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="info-box">
                <h3>📎 Attached Files:</h3>
                <ul>
                  <li>✓ Complete Registration PDF</li>
                  <li>✓ All uploaded documents (in Google Drive)</li>
                </ul>
              </div>
              
              ${data.driveLink ? `
              <div class="info-box">
                <h3>📁 Google Drive Folder:</h3>
                <p>All client documents have been uploaded to their dedicated folder:</p>
                <center>
                  <a href="${data.driveLink}" class="button">Open Client Folder in Drive</a>
                </center>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">
                  Folder contents: Registration PDF, uploaded documents (photos, passports, certificates)
                </p>
              </div>
              ` : ''}
              
              <div class="info-box">
                <h3>⚡ Action Required:</h3>
                <ol>
                  <li>Review the attached registration PDF</li>
                  <li>Verify all uploaded documents in Google Drive</li>
                  <li>Check for completeness and accuracy</li>
                  <li>Process the application for government submission</li>
                </ol>
              </div>
              
              <p><strong>Note:</strong> Client has been notified of successful submission and is awaiting your review.</p>
              
              <div class="footer">
                <p><strong>DRSI Law Admin Portal</strong></p>
                <p>This is an automated notification from the registration system.</p>
                <p>© 2025 DRSI Law. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Registration_${data.firstName}_${data.lastName}_${data.registrationId}.pdf`,
          content: data.registrationPdf,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration notification sent to admin: ${adminEmail}`);
  } catch (error) {
    console.error("❌ Error sending registration email to admin:", error);
    throw new Error("Failed to send registration email to admin");
  }
}

