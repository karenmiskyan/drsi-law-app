# 📝 DRSI Law - Registration Wizard (Link 3)

## Overview

This is the **Registration Form** that users complete AFTER payment. It can be accessed in two modes:
1. **Authenticated Mode** (with token) - Pre-filled from payment data
2. **Public Mode** (no token) - Manual entry

---

## 🚀 How to Access

### Authenticated Users (Paid via Stripe):
```
http://localhost:3000/register?token=GENERATED_TOKEN
```

### Public Users (Manual Entry):
```
http://localhost:3000/register
```

---

## 🧪 Testing the Registration Wizard

### 1. Test Public Access (No Token)

```bash
# Start dev server
npm run dev

# Open in browser
http://localhost:3000/register
```

**Expected Behavior:**
- All fields are **EMPTY**
- All fields are **EDITABLE**
- No "Authenticated User" badge
- User can manually enter all information

**Test Flow:**
1. Fill Step 1: Personal information
2. Select education level - verify alert for "Primary" or "High School (No Degree)"
3. Continue to Step 2
4. Select marital status
5. If "Married" selected → Spouse section appears
6. Continue to Step 3
7. Enter number of children → Forms appear dynamically
8. Toggle "US Citizen/LPR" for a child
9. Continue to Step 4
10. Upload documents using drag-and-drop or click
11. Continue to Step 5
12. Review all data
13. Submit

---

### 2. Test Authenticated Access (With Token)

#### Generate a Test Token:

```typescript
// In browser console or Node.js
const token = btoa(JSON.stringify({
  firstName: "Karen",
  lastName: "Misakyan",
  email: "karen@example.com",
  phone: "+972123456789",
  maritalStatus: "married",
  expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
}));

console.log("Token:", token);
```

#### Use the Token:

```
http://localhost:3000/register?token=YOUR_TOKEN_HERE
```

**Expected Behavior:**
- "Authenticated User" badge appears
- First Name, Last Name, Email, Phone are **PRE-FILLED**
- Contact fields are **READ-ONLY** (gray background)
- Marital Status is **PRE-SELECTED** from payment
- All other fields are **EDITABLE**

**Test Flow:**
1. Verify contact info is pre-filled and locked
2. Verify marital status matches token
3. Complete remaining fields in Step 1
4. Continue through all steps normally

---

## 📱 Mobile Responsiveness

The wizard is fully responsive:

### Desktop (1024px+):
- Full progress bar with all step labels
- Two-column layouts for form fields
- Larger cards and spacing

### Tablet (768px - 1023px):
- Simplified progress bar
- Responsive grid columns
- Comfortable touch targets

### Mobile (< 768px):
- Current step indicator only
- Single column layouts
- Large touch-friendly buttons
- Stacked form fields
- Optimized document upload zones

**Test on Mobile:**
1. Open browser DevTools (F12)
2. Toggle device toolbar
3. Select "iPhone 14" or "Pixel 7"
4. Test entire flow on mobile viewport

---

## 🔄 State Management (Zustand)

The form uses Zustand with persistence:

```typescript
// Data persists across page reloads
localStorage.getItem('drsi-registration-form')

// To clear saved progress:
localStorage.removeItem('drsi-registration-form')
```

### What's Persisted:
- ✅ Current step
- ✅ Applicant info
- ✅ Marital status
- ✅ Spouse info
- ✅ Children data
- ❌ Documents (files can't be serialized)

---

## 🎯 Key Features

### Step 1: Applicant Information
- Contact info (lockable for authenticated users)
- Date of birth picker (Day/Month/Year)
- Gender selection
- Birth place with searchable country dropdown
- Mailing address
- Education level with **conditional alert**:
  - Primary School → Shows work experience requirement
  - High School (No Degree) → Shows work experience requirement

### Step 2: Marital Status & Spouse
- Marital status selection
- **Conditional rendering**:
  - If "Married" → Spouse section appears
  - If other status → Spouse section hidden
- Full spouse details (name, DOB, gender, birth place, education)

### Step 3: Children Details
- Dynamic number input (0-10 children)
- **Auto-generate** child forms based on count
- Each child has:
  - Full name, DOB, gender, birth place
  - "US Citizen/LPR" toggle
- **Conditional validation**:
  - US Citizens/LPRs marked as optional for documents

### Step 4: Document Upload
- **react-dropzone** integration
- Accordion-based organization:
  - Applicant documents (always shown)
  - Spouse documents (conditional on marital status)
  - Children documents (dynamic based on count)
- File validation:
  - Accepted: JPG, PNG, PDF
  - Max size: 10MB per file
- Visual feedback:
  - Drag-and-drop indicator
  - File name and size display
  - Green checkmark when uploaded

### Step 5: Review & Submit
- Summary of all entered data
- Organized sections:
  - Applicant info
  - Marital status & spouse
  - Children
  - Documents count
- Submit button with loading state
- Success confirmation page

---

## 🔒 Token Verification Flow

### Backend Integration (To Implement):

```typescript
// src/app/api/verify-token/route.ts
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  
  // Verify token against database
  const user = await db.verifyRegistrationToken(token);
  
  if (!user || user.tokenExpired) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  
  return NextResponse.json({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    maritalStatus: user.maritalStatus,
  });
}
```

### Generating Tokens (After Payment):

```typescript
// In webhook after successful payment
import { generateTestToken } from "@/lib/tokenVerification";

const registrationToken = generateTestToken({
  firstName: customerData.firstName,
  lastName: customerData.lastName,
  email: customerData.email,
  phone: customerData.phone,
  maritalStatus: customerData.maritalStatus,
});

// Send email with link
const registrationLink = `https://drsilaw.com/register?token=${registrationToken}`;
await sendWelcomeEmail({
  to: customerData.email,
  registrationFormLink: registrationLink,
});
```

---

## 📤 Form Submission

### TODO: Implement Backend API

```typescript
// src/app/api/submit-registration/route.ts
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  // Extract form data
  const applicantInfo = JSON.parse(formData.get("applicantInfo"));
  const documents = formData.getAll("documents");
  
  // 1. Upload documents to storage (S3, Google Cloud Storage)
  const documentUrls = await uploadDocuments(documents);
  
  // 2. Save registration data to database
  await db.registrations.create({
    ...applicantInfo,
    documentUrls,
    status: "submitted",
    submittedAt: new Date(),
  });
  
  // 3. Send confirmation email
  await sendConfirmationEmail(applicantInfo.email);
  
  // 4. Update Monday.com or CRM
  await updateCRM(applicantInfo);
  
  return NextResponse.json({ success: true });
}
```

---

## 🎨 Design Specifications

### Colors:
- **Primary Red**: `#B02828`
- **Primary Dark**: `#8B1F1F`
- **Background**: `#F9FAFB`
- **Text**: `#111827` (Gray-900)
- **Success**: `#10B981` (Green-600)
- **Error**: `#EF4444` (Red-500)

### Typography:
- **Font Family**: Inter / System UI
- **Headings**: Bold, 20-32px
- **Body**: Regular, 14-16px
- **Labels**: Medium, 14px

### Spacing:
- **Card Padding**: 24px
- **Section Gaps**: 24px
- **Field Gaps**: 16px
- **Button Height**: 44px

---

## 🐛 Common Issues & Solutions

### Issue: Form data not persisting
**Solution:** Check localStorage and Zustand persist config

### Issue: Token verification fails
**Solution:** Ensure token is valid base64 JSON and not expired

### Issue: Documents not uploading
**Solution:** Check file size (< 10MB) and format (JPG/PNG/PDF)

### Issue: Children forms not appearing
**Solution:** Enter a number > 0 in the children count field

### Issue: Spouse section not showing
**Solution:** Select "Married" from marital status dropdown

### Issue: Read-only fields not working
**Solution:** Verify token is present in URL and isReadOnly is true

---

## 📊 Data Structure

### Complete Registration Object:

```typescript
{
  // Access control
  isAuthenticated: boolean,
  token: string | null,
  isReadOnly: boolean,
  
  // Progress
  currentStep: 1-5,
  
  // Step 1
  applicantInfo: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    dateOfBirth: { day, month, year },
    gender: "male" | "female",
    cityOfBirth: string,
    countryOfBirth: string,
    mailingAddress: string,
    educationLevel: string
  },
  
  // Step 2
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "separated",
  spouseInfo: {
    fullName: string,
    dateOfBirth: { day, month, year },
    gender: "male" | "female",
    cityOfBirth: string,
    countryOfBirth: string,
    educationLevel: string
  } | null,
  
  // Step 3
  numberOfChildren: number,
  children: Array<{
    id: string,
    fullName: string,
    dateOfBirth: { day, month, year },
    gender: "male" | "female",
    birthPlace: string,
    isUSCitizenOrLPR: boolean
  }>,
  
  // Step 4
  documents: {
    applicant: {
      photo: File | null,
      passport: File | null,
      educationDoc: File | null
    },
    spouse: {
      photo: File | null,
      passport: File | null,
      educationDoc: File | null,
      marriageCert: File | null
    } | null,
    children: {
      [childId]: {
        photo: File | null,
        passport: File | null,
        birthCert: File | null
      }
    }
  }
}
```

---

## ✅ Testing Checklist

### Functionality:
- [ ] Public access works (no token)
- [ ] Authenticated access works (with token)
- [ ] Contact fields lock when authenticated
- [ ] Step navigation (next/previous)
- [ ] Form validation on each step
- [ ] Education level alert appears
- [ ] Spouse section shows/hides based on marital status
- [ ] Children forms generate dynamically
- [ ] US Citizen toggle works
- [ ] Documents upload via drag-and-drop
- [ ] Documents upload via click
- [ ] Review page shows all data
- [ ] Submit button works
- [ ] Success page displays

### Mobile:
- [ ] Progress indicator readable on mobile
- [ ] Forms usable on mobile (viewport < 768px)
- [ ] Touch targets are large enough (min 44px)
- [ ] No horizontal scrolling
- [ ] Dropzones work on mobile

### Data Persistence:
- [ ] Data persists on page reload
- [ ] Step progress is saved
- [ ] Can continue from saved step

### Edge Cases:
- [ ] Invalid token shows public mode
- [ ] Expired token shows public mode
- [ ] 0 children skips child forms
- [ ] 10+ children handled gracefully
- [ ] Large files (> 10MB) rejected
- [ ] Invalid file types rejected

---

## 🚀 Deployment Notes

### Environment Variables Needed:
```env
NEXT_PUBLIC_APP_URL=https://drsilaw.com
DATABASE_URL=...
STORAGE_BUCKET_URL=...
```

### Before Production:
1. Implement backend API for token verification
2. Implement document upload to cloud storage
3. Implement form submission to database
4. Add CAPTCHA for public submissions
5. Add rate limiting
6. Add analytics tracking
7. Test on real mobile devices
8. Accessibility audit (WCAG 2.1)
9. Performance testing
10. Security audit

---

## 📞 Support

For questions or issues:
- Email: support@drsilaw.com
- Documentation: /docs/registration-wizard
- API Docs: /api-docs

---

✅ **Registration Wizard is Complete and Ready for Testing!**


