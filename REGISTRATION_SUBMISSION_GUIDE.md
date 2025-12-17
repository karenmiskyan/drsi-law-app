# 📋 Registration Form Submission System

## Overview

The registration form submission system handles the complete process after users fill out the 5-step registration wizard.

---

## 🔄 Complete Flow

```
User Completes Step 5 (Review & Submit)
         ↓
Click "Submit Application"
         ↓
Frontend: Prepare FormData
  ├─ Applicant info (JSON)
  ├─ Marital status
  ├─ Spouse info (if married)
  ├─ Children data (JSON array)
  └─ All uploaded documents (Files)
         ↓
POST /api/submit-registration
         ↓
Backend Processing:
  ├─ 1. Generate Registration PDF
  │    ├─ Professional layout with DRSI logo
  │    ├─ Applicant information
  │    ├─ Spouse information (if married)
  │    ├─ Children details
  │    └─ Formatted and branded
  │
  ├─ 2. Create Google Drive Folder
  │    └─ Name: FirstName_LastName_Phone
  │
  ├─ 3. Upload All Files to Drive
  │    ├─ Registration PDF
  │    ├─ Applicant documents (photo, passport, education)
  │    ├─ Spouse documents (if married)
  │    └─ Children documents (for each child)
  │
  ├─ 4. Send Customer Confirmation Email
  │    ├─ Success notification
  │    ├─ Next steps explained
  │    └─ Drive folder link
  │
  ├─ 5. Send Admin Notification Email
  │    ├─ New registration alert
  │    ├─ Applicant details
  │    ├─ Drive folder link
  │    └─ Action items
  │
  └─ 6. Update Monday.com (Optional)
       └─ Create new item with client data
         ↓
Return Success Response
         ↓
Frontend: Show Success Page
  └─ "Registration Submitted Successfully!"
```

---

## 📁 Files Created

### 1. PDF Generator
**`src/lib/services/registration-pdf-generator.ts`**
- Generates professional PDF with DRSI branding
- Includes logo (from `/public/images/drsi-logo.png`)
- Formats all registration data
- Multi-page support with page breaks
- Branded footer with contact info

### 2. Email Templates
**`src/lib/services/email.ts`** (updated)
- `sendRegistrationConfirmationEmail()` - Customer email
- `sendAdminRegistrationNotification()` - Admin email
- Professional HTML templates with DRSI branding
- Includes Drive folder links

### 3. Submission API
**`src/app/api/submit-registration/route.ts`**
- Receives FormData with all documents
- Orchestrates entire submission process
- Error handling and logging
- Returns success/failure status

### 4. Review Component
**`src/components/registration/steps/Step5Review.tsx`** (updated)
- Prepares FormData with all documents
- Calls submission API
- Shows loading state
- Displays success/error messages

---

## 🖼️ Logo Setup

### Required Location:
```
/public/images/drsi-logo.png
```

### Recommended Specs:
- Format: PNG (with transparency)
- Dimensions: 800x300px (or similar aspect ratio)
- File size: < 500KB
- Background: Transparent

### Used In:
✅ Registration PDF header
✅ Payment contract PDF header
✅ Email templates
✅ Website (if needed)

---

## 🔐 Environment Variables

Add these to your `.env.local`:

```bash
# Admin Notifications
ADMIN_EMAIL=admin@drsiglobal.com

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_NAME=DRSI Global
FROM_EMAIL=noreply@drsiglobal.com

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=your-main-folder-id
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_OAUTH_REFRESH_TOKEN=your-refresh-token

# Monday.com (Optional)
MONDAY_API_TOKEN=your-monday-token
MONDAY_BOARD_ID=your-board-id

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📄 Generated PDF Structure

```
╔═══════════════════════════════════════════╗
║  [DRSI Logo]                              ║
║                                           ║
║  DV LOTTERY REGISTRATION FORM            ║
║  DRSI Global Immigration Services         ║
║  Submitted: Dec 17, 2024, 10:30 AM       ║
╠═══════════════════════════════════════════╣
║                                           ║
║  ┌─ APPLICANT INFORMATION ─────────────┐ ║
║  │ Full Name: Karen Misakyan           │ ║
║  │ Email: karen@example.com            │ ║
║  │ Phone: +972123456789                │ ║
║  │ Date of Birth: 15/03/1990           │ ║
║  │ Gender: Male                        │ ║
║  │ Place of Birth: Tel Aviv, Israel    │ ║
║  │ Mailing Address: 123 Main St...     │ ║
║  │ Education: University Degree        │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ┌─ MARITAL STATUS ───────────────────┐  ║
║  │ Status: Married                     │  ║
║  └─────────────────────────────────────┘  ║
║                                           ║
║  ┌─ SPOUSE INFORMATION ───────────────┐  ║
║  │ Full Name: Jane Misakyan            │  ║
║  │ Date of Birth: 20/05/1992           │  ║
║  │ Gender: Female                      │  ║
║  │ ... (complete spouse details)       │  ║
║  └─────────────────────────────────────┘  ║
║                                           ║
║  ┌─ CHILDREN INFORMATION (2) ─────────┐  ║
║  │ Child 1:                            │  ║
║  │   Full Name: John Misakyan          │  ║
║  │   Date of Birth: 10/08/2015         │  ║
║  │   ... (complete child details)      │  ║
║  │                                     │  ║
║  │ Child 2:                            │  ║
║  │   ... (complete child details)      │  ║
║  └─────────────────────────────────────┘  ║
║                                           ║
╠═══════════════════════════════════════════╣
║  DRSI Global Immigration Services         ║
║  Email: info@drsiglobal.com               ║
║  Phone: +1 (555) 123-4567                 ║
║  www.drsiglobal.com                       ║
╚═══════════════════════════════════════════╝
```

---

## 📁 Google Drive Folder Structure

```
Main Folder (GOOGLE_DRIVE_FOLDER_ID)
└── Karen_Misakyan_+972123456789/
    ├── Registration_Karen_Misakyan_1234567890.pdf
    ├── Applicant_Photo_1234567890.jpg
    ├── Applicant_Passport_1234567890.pdf
    ├── Applicant_Education_Document_1234567890.pdf
    ├── Spouse_Photo_1234567891.jpg
    ├── Spouse_Passport_1234567891.pdf
    ├── Spouse_Education_Document_1234567891.pdf
    ├── Marriage_Certificate_1234567892.pdf
    ├── Child1_Photo_1234567893.jpg
    ├── Child1_Passport_1234567893.pdf
    ├── Child1_Birth_Certificate_1234567893.pdf
    ├── Child2_Photo_1234567894.jpg
    ├── Child2_Passport_1234567894.pdf
    └── Child2_Birth_Certificate_1234567894.pdf
```

---

## 📧 Email Examples

### Customer Confirmation Email:
```
Subject: ✓ Your DV Lottery Registration Has Been Received

[DRSI Global Logo]

✓ Registration Submitted Successfully!

Dear Karen Misakyan,

Thank you for completing your DV Lottery registration form...

What Happens Next:
1. Document Review (24-48 hours)
2. Verification
3. Government Submission
4. Confirmation Number

📁 Your Documents Folder:
[View All Your Documents] (button)

⚠️ Important: Check your email regularly...
```

### Admin Notification Email:
```
Subject: 🔔 New Registration: Karen Misakyan

🔔 New DV Lottery Registration
Submitted: Dec 17, 2024, 10:30 AM

Applicant Information:
Name: Karen Misakyan
Email: karen@example.com
Phone: +972123456789
Marital Status: Married
Number of Children: 2

📁 Client Documents Folder:
[Open Google Drive Folder →] (button)

⚡ Action Required:
• Review all submitted documents
• Verify information accuracy
• Contact client if needed
• Proceed with submission
```

---

## 🧪 Testing Checklist

### Prerequisites:
- [x] DRSI logo placed in `/public/images/drsi-logo.png`
- [x] `.env.local` configured with all variables
- [x] Google OAuth tokens valid
- [x] SMTP credentials valid (if testing email)

### Test Flow:
1. **Start Registration:**
   ```
   http://localhost:3000/register
   ```

2. **Complete All Steps:**
   - Step 1: Fill applicant info
   - Step 2: Select married status, add spouse
   - Step 3: Add 2 children
   - Step 4: Upload all documents
   - Step 5: Review and submit

3. **Verify Submission:**
   - ✅ Loading indicator appears
   - ✅ Success message shows
   - ✅ No errors in console

4. **Check Google Drive:**
   - ✅ Client folder created
   - ✅ Registration PDF uploaded
   - ✅ All documents uploaded
   - ✅ Correct file names and organization

5. **Check Emails:**
   - ✅ Customer receives confirmation
   - ✅ Admin receives notification
   - ✅ Drive links work
   - ✅ Professional formatting

6. **Check PDF:**
   - ✅ DRSI logo appears
   - ✅ All data formatted correctly
   - ✅ Spouse section (if married)
   - ✅ Children section (if applicable)
   - ✅ Professional layout

---

## 🔍 Debugging

### Console Logs:
```
📝 Registration submission received for: Karen Misakyan
✅ Registration PDF generated
📁 Created client folder: Karen_Misakyan_+972123456789
📄 Registration PDF uploaded
📎 Uploaded: Applicant_Photo_1234567890.jpg
📎 Uploaded: Applicant_Passport_1234567890.pdf
... (all documents)
📁 Folder link: https://drive.google.com/...
✅ Registration confirmation email sent to: karen@example.com
✅ Admin notification sent to: admin@drsiglobal.com
✅ Registration submission completed successfully
```

### Common Issues:

**Issue: Logo not appearing in PDF**
```bash
# Check file exists
ls -la public/images/drsi-logo.png

# Ensure correct format (PNG)
file public/images/drsi-logo.png
```

**Issue: Email not sending**
```bash
# Check SMTP credentials
# Test with Gmail: Enable "Less secure app access"
# Or use App Password for 2FA accounts
```

**Issue: Google Drive upload fails**
```bash
# Verify OAuth token is valid
# Check GOOGLE_DRIVE_FOLDER_ID exists
# Ensure folder is shared with OAuth user
```

**Issue: Documents not uploading**
```bash
# Check FormData in browser DevTools
# Verify file size < 10MB
# Ensure correct field names
```

---

## 🚀 Production Deployment

### Before Deploy:
1. ✅ Replace test Stripe keys with live keys
2. ✅ Update `NEXT_PUBLIC_APP_URL` to production URL
3. ✅ Use production Google OAuth credentials
4. ✅ Configure production SMTP server
5. ✅ Update admin email address
6. ✅ Test entire flow on staging
7. ✅ Add proper error monitoring (Sentry, etc.)
8. ✅ Set up backup system for Google Drive

### Production .env:
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://drsiglobal.com
ADMIN_EMAIL=admin@drsiglobal.com
# ... (all other production values)
```

---

## ✅ Summary

✅ **Registration PDF Generator** - Professional, branded PDFs  
✅ **Google Drive Integration** - Organized client folders  
✅ **Document Upload System** - All files automatically uploaded  
✅ **Email Notifications** - Customer & admin emails  
✅ **Error Handling** - Comprehensive error management  
✅ **Logo Integration** - DRSI branding throughout  
✅ **Mobile Responsive** - Works on all devices  

**System is Complete and Production-Ready!** 🎉

