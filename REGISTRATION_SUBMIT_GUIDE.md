# 📤 Registration Form Submission System

## Overview

Complete system for processing registration form submissions with:
- ✅ Professional PDF generation
- ✅ Google Drive upload (documents + PDF)
- ✅ Email notifications (customer + admin)
- ✅ Logo integration
- ✅ Comprehensive data handling

---

## 🔄 Complete Flow

```
User Completes Step 5 (Review & Submit)
         ↓
1. Click "Submit Application"
         ↓
2. Frontend prepares FormData
   ├─ Applicant info
   ├─ Spouse info (if married)
   ├─ Children info
   └─ All uploaded documents
         ↓
3. POST to /api/submit-registration
         ↓
4. Backend Processing:
   │
   ├─ Generate Registration PDF
   │   ├─ Applicant details
   │   ├─ Spouse details (if married)
   │   ├─ Children details
   │   ├─ DRSI Logo
   │   └─ Professional formatting
   │
   ├─ Create Google Drive Folder
   │   └─ Format: FirstName_LastName_Phone_REG-ID
   │
   ├─ Upload Registration PDF
   │
   ├─ Upload All Documents
   │   ├─ Applicant: Photo, Passport, Education
   │   ├─ Spouse: Photo, Passport, Education, Marriage Cert
   │   └─ Children: Photo, Passport, Birth Certificate (each)
   │
   ├─ Send Customer Email
   │   ├─ Confirmation
   │   ├─ Registration details
   │   ├─ Google Drive folder link
   │   └─ Next steps
   │
   └─ Send Admin Email
       ├─ New registration notification
       ├─ Client info
       ├─ Google Drive folder link
       └─ Action items
         ↓
5. Return Success Response
         ↓
6. Show Success Page to User
```

---

## 📁 Files Created

### Core Services:

1. **`src/lib/services/registration-pdf-generator.ts`**
   - Generates professional registration PDF
   - Includes all applicant, spouse, and children information
   - DRSI logo integration
   - Formatted sections with proper styling

2. **`src/lib/services/registration-email.ts`**
   - `sendRegistrationConfirmationEmail()` - Customer email
   - `sendAdminNotificationEmail()` - Admin email
   - HTML templates with logo
   - Professional styling

3. **`src/app/api/submit-registration/route.ts`**
   - Main submission handler
   - Orchestrates all operations
   - Error handling
   - Detailed logging

### Updated Files:

4. **`src/components/registration/steps/Step5Review.tsx`**
   - `handleSubmit()` function updated
   - FormData preparation
   - Document upload logic
   - Error handling

5. **`src/lib/services/pdf-generator.ts`** (Payment Contract)
   - Added logo integration
   - Dynamic yPosition for layout

---

## 🖼️ Logo Setup

### 1. Add Logo File:

```bash
# Place your DRSI GLOBAL logo here:
public/images/drsi-logo.png
```

**Requirements:**
- Format: PNG (recommended) or JPG
- Size: Recommended 800x300px or similar
- Transparent background (for PNG)
- High quality for PDF rendering

### 2. Logo Usage:

The logo is automatically used in:
- ✅ Registration PDF (top of document)
- ✅ Payment contract PDF (top of document)
- ✅ Customer email (header)
- ✅ Admin email (header)

### 3. Fallback:

If logo is not found:
- PDFs will generate without logo
- Emails will show text-only header
- No errors, just a console warning

---

## 🔐 Environment Variables

### Required for Full Functionality:

```env
# .env.local

# === Stripe ===
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# === Google OAuth (for Drive) ===
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_OAUTH_REFRESH_TOKEN=...

# === Google Drive ===
GOOGLE_DRIVE_FOLDER_ID=... (main parent folder ID)

# === Email ===
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@drsilaw.com (← NEW!)

# === Monday.com (optional) ===
MONDAY_API_KEY=...
MONDAY_BOARD_ID=...
```

### ⚠️ IMPORTANT: Add Admin Email

```env
ADMIN_EMAIL=admin@drsilaw.com
```

This email will receive all new registration notifications.

---

## 📊 Registration PDF Structure

```
┌─────────────────────────────────────────────┐
│  [DRSI LOGO]                                │
│                                             │
│  DV LOTTERY REGISTRATION                    │
│  DRSI Law - Immigration Services            │
│  Registration ID: REG-1234567890-ABC        │
│  Submission Date: December 17, 2025         │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  1. MAIN APPLICANT INFORMATION              │
│     Full Name: Karen Misakyan               │
│     Email: karen@example.com                │
│     Phone: +972123456789                    │
│     Date of Birth: 15/06/1990               │
│     Gender: Male                            │
│     Birth Place: Tel Aviv, Israel           │
│     Mailing Address: 123 Main St...         │
│     Education Level: Bachelor's Degree      │
│                                             │
│  2. MARITAL STATUS                          │
│     Status: Married                         │
│                                             │
│  3. SPOUSE INFORMATION                      │
│     Full Name: Jane Misakyan                │
│     Date of Birth: 20/08/1992               │
│     Gender: Female                          │
│     Birth Place: Haifa, Israel              │
│     Education Level: Master's Degree        │
│                                             │
│  4. CHILDREN INFORMATION                    │
│     Number of Children: 2                   │
│                                             │
│     Child 1:                                │
│       Name: John Misakyan                   │
│       Date of Birth: 10/03/2015             │
│       Gender: Male                          │
│       Birth Place: Jerusalem, Israel        │
│       US Citizen/LPR: No                    │
│                                             │
│     Child 2:                                │
│       Name: Mary Misakyan                   │
│       Date of Birth: 05/07/2018             │
│       Gender: Female                        │
│       Birth Place: Jerusalem, Israel        │
│       US Citizen/LPR: No                    │
│                                             │
│  5. DECLARATION                             │
│     I hereby declare that all information   │
│     provided in this registration form is   │
│     true, accurate, and complete...         │
│                                             │
│     Applicant Name: Karen Misakyan          │
│     Date: December 17, 2025                 │
│                                             │
├─────────────────────────────────────────────┤
│  © DRSI Law - Immigration Services          │
│  Confidential Document                      │
└─────────────────────────────────────────────┘
```

---

## 📧 Email Templates

### Customer Email:

**Subject:** ✅ Registration Confirmed - REG-1234567890-ABC

**Content:**
- ✅ Confirmation message
- 📋 Registration details (ID, date, status, children count)
- 📌 What happens next (4 steps)
- 📂 Google Drive folder link
- ⚠️ Important reminders
- 📧 Contact support options

**Design:**
- Red gradient header with logo
- Professional sections
- Action buttons
- Mobile responsive

### Admin Email:

**Subject:** 🆕 New Registration: Karen Misakyan - REG-1234567890-ABC

**Content:**
- 👤 Client information (name, email, phone)
- 📋 Registration details
- ⚡ Action required checklist
- 📂 Quick access to documents
- 📄 Download registration PDF button

**Design:**
- Blue gradient header with logo
- Emphasis on action items
- Direct links to all resources

---

## 📂 Google Drive Structure

```
Main Folder (GOOGLE_DRIVE_FOLDER_ID)
└── Karen_Misakyan_+972123456789_REG-1234567890-ABC/
    ├── Registration_Karen_Misakyan_1765988000000.pdf
    ├── Applicant_Photo_Karen_Misakyan.jpg
    ├── Applicant_Passport_Karen_Misakyan.pdf
    ├── Applicant_Education_Karen_Misakyan.pdf
    ├── Spouse_Photo_Jane_Misakyan.jpg
    ├── Spouse_Passport_Jane_Misakyan.pdf
    ├── Spouse_Education_Jane_Misakyan.pdf
    ├── Marriage_Certificate.pdf
    ├── Child1_Photo_John_Misakyan.jpg
    ├── Child1_Passport_John_Misakyan.pdf
    ├── Child1_BirthCertificate_John_Misakyan.pdf
    ├── Child2_Photo_Mary_Misakyan.jpg
    ├── Child2_Passport_Mary_Misakyan.pdf
    └── Child2_BirthCertificate_Mary_Misakyan.pdf
```

**Naming Convention:**
- Folder: `{FirstName}_{LastName}_{Phone}_{RegistrationID}`
- Files: `{Type}_{Name}.{extension}`

---

## 🧪 Testing

### 1. Complete Registration Flow:

```bash
# 1. Start server
npm run dev

# 2. Visit registration page
http://localhost:3001/register

# 3. Fill all steps:
#    - Step 1: Personal info
#    - Step 2: Marital status (select "Married")
#    - Step 3: Add 2 children
#    - Step 4: Upload all documents
#    - Step 5: Review & Submit
```

### 2. Check Console Logs:

```
📝 Processing registration: REG-1234567890-ABC
   Applicant: Karen Misakyan
   Email: karen@example.com
   Marital Status: married
   Children: 2
📄 Generating registration PDF...
✅ Registration PDF generated
📁 Creating Google Drive folder: Karen_Misakyan_+972123456789_REG-1234567890-ABC
✅ Registration PDF uploaded to Google Drive
   Folder: https://drive.google.com/drive/folders/...
   PDF: https://drive.google.com/file/d/...
📤 Uploading supporting documents...
   ✅ Applicant photo uploaded
   ✅ Applicant passport uploaded
   ✅ Applicant education document uploaded
   ✅ Spouse photo uploaded
   ✅ Spouse passport uploaded
   ✅ Spouse education document uploaded
   ✅ Marriage certificate uploaded
   ✅ Child 1 photo uploaded
   ✅ Child 1 passport uploaded
   ✅ Child 1 birth certificate uploaded
   ✅ Child 2 photo uploaded
   ✅ Child 2 passport uploaded
   ✅ Child 2 birth certificate uploaded
✅ All documents uploaded to Google Drive
📧 Sending confirmation emails...
✅ Customer confirmation email sent to: karen@example.com
✅ Admin notification email sent to: admin@drsilaw.com
✅ Emails sent: { customer: true, admin: true }
```

### 3. Verify Results:

#### Google Drive:
- [ ] New folder created
- [ ] Registration PDF uploaded
- [ ] All documents uploaded
- [ ] Files named correctly
- [ ] Folder permissions set (anyone with link)

#### Emails:
- [ ] Customer email received
- [ ] Admin email received
- [ ] Logo displays correctly
- [ ] Links work
- [ ] Mobile rendering OK

#### PDF:
- [ ] Logo appears at top
- [ ] All sections present
- [ ] Data formatted correctly
- [ ] No layout issues
- [ ] Professional appearance

---

## 🔍 Troubleshooting

### Issue: Logo Not Showing in PDF

**Solution:**
```bash
# Check logo exists
ls -la public/images/drsi-logo.png

# If not, add the logo file
cp /path/to/your/logo.png public/images/drsi-logo.png
```

### Issue: Emails Not Sending

**Solution:**
```bash
# Check environment variables
echo $EMAIL_USER
echo $EMAIL_PASSWORD
echo $ADMIN_EMAIL

# If using Gmail, enable "App Passwords"
# https://myaccount.google.com/apppasswords
```

### Issue: Google Drive Upload Fails

**Solution:**
```bash
# Check OAuth tokens
echo $GOOGLE_OAUTH_REFRESH_TOKEN

# Re-authorize if needed
# Visit: http://localhost:3001/api/auth/google/authorize
```

### Issue: Documents Not Uploading

**Check:**
1. File size < 10MB
2. Correct file types (JPG, PNG, PDF)
3. FormData naming matches API expectations

---

## 📊 API Response Structure

### Success Response:

```json
{
  "success": true,
  "registrationId": "REG-1765988000000-ABC123",
  "message": "Registration submitted successfully",
  "data": {
    "registrationId": "REG-1765988000000-ABC123",
    "submissionDate": "December 17, 2025",
    "folderLink": "https://drive.google.com/drive/folders/...",
    "registrationPdfLink": "https://drive.google.com/file/d/...",
    "documentLinks": {
      "applicant_photo": "https://drive.google.com/file/d/...",
      "applicant_passport": "https://drive.google.com/file/d/...",
      "applicant_education": "https://drive.google.com/file/d/...",
      "spouse_photo": "https://drive.google.com/file/d/...",
      ...
    },
    "emailsSent": {
      "customer": true,
      "admin": true
    }
  }
}
```

### Error Response:

```json
{
  "success": false,
  "error": "Failed to submit registration",
  "message": "Detailed error message here"
}
```

---

## ✅ Complete Checklist

### Setup:
- [ ] Logo added to `public/images/drsi-logo.png`
- [ ] `ADMIN_EMAIL` in `.env.local`
- [ ] `EMAIL_USER` and `EMAIL_PASSWORD` configured
- [ ] Google OAuth tokens configured
- [ ] `GOOGLE_DRIVE_FOLDER_ID` set

### Testing:
- [ ] Registration form submits successfully
- [ ] PDF generates with logo
- [ ] Google Drive folder created
- [ ] All documents uploaded
- [ ] Customer email received
- [ ] Admin email received
- [ ] Success page displays

### Production:
- [ ] All environment variables set on production server
- [ ] Logo file deployed
- [ ] Email credentials work
- [ ] Google OAuth tokens valid
- [ ] Test end-to-end flow

---

## 🚀 Ready to Use!

System is complete and ready for production use. Make sure to:

1. Add your DRSI GLOBAL logo
2. Set `ADMIN_EMAIL` environment variable
3. Test the complete flow
4. Monitor the first few submissions

**Questions?** Check the main README.md or contact support.

---

✅ **Registration Submission System - Complete!** 🎉

