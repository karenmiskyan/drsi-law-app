# 🌐 Registration Form - Hebrew Translation Implementation Guide

## ✅ What's Been Completed

### 1. **Translation Files Created**

**File:** `src/lib/i18n/registrationTranslations.ts`

- ✅ **Complete English translations** for all registration form text
- ✅ **Complete Hebrew translations** (עברית) for all registration form text
- ✅ **Comprehensive coverage:**
  - Header & footer
  - All 5 steps
  - Common UI elements (buttons, labels, validation)
  - All form fields and placeholders
  - Progress indicator
  - Success/error messages

### 2. **Language Context Created**

**File:** `src/contexts/RegistrationLanguageContext.tsx`

- ✅ React Context for language state management
- ✅ `useRegistrationLanguage()` hook for accessing translations
- ✅ **RTL (Right-to-Left) support** for Hebrew
- ✅ **localStorage persistence** - user's language choice is saved
- ✅ **Automatic document direction** - updates `<html dir="rtl">` for Hebrew

### 3. **Language Switcher Component**

**File:** `src/components/registration/RegistrationLanguageSwitcher.tsx`

- ✅ Beautiful toggle between English and Hebrew
- ✅ Active state highlighting
- ✅ Globe icon for clarity
- ✅ Centered below header

### 4. **Provider Integration**

**File:** `src/app/register/page.tsx`

- ✅ Wrapped `RegistrationWizard` with `RegistrationLanguageProvider`
- ✅ Language context available throughout registration form

### 5. **Components Already Translated**

#### ✅ `RegistrationWizard.tsx`
- Header title
- Subtitle
- Authenticated badge
- Footer company name & tagline
- Contact information
- Copyright

#### ✅ `RegistrationProgress.tsx`
- Step names (Applicant Info, Marital Status, etc.)
- Mobile progress text ("Step X of Y")
- All 5 steps labeled

---

## 📋 Components That Still Need Translation

To complete the full multilingual experience, the following step components need to be updated:

### 🔲 Step 1: Applicant Information
**File:** `src/components/registration/steps/Step1ApplicantInfo.tsx`

**What needs translation:**
- Card title & description
- Section headers (Contact Information, Personal Information, Education, Current Residence)
- All field labels (First Name, Last Name, Email, Phone, Date of Birth, etc.)
- All placeholders
- Education level dropdown options
- Education alert message
- Validation error messages
- Back/Continue buttons

**How to implement:**
```tsx
import { useRegistrationLanguage } from "@/contexts/RegistrationLanguageContext";

export function Step1ApplicantInfo() {
  const { t } = useRegistrationLanguage();
  
  // Use translations:
  // t.step1.title
  // t.step1.firstName
  // t.step1.placeholders.firstName
  // etc.
}
```

---

### 🔲 Step 2: Marital Status
**File:** `src/components/registration/steps/Step2MaritalStatus.tsx`

**What needs translation:**
- Card title & description
- Marital status label & placeholder
- Marital status options (Single, Married, Divorced, etc.)
- Spouse section header
- All spouse field labels
- Spouse US Citizen question
- Validation messages
- Buttons

---

### 🔲 Step 3: Children Details
**File:** `src/components/registration/steps/Step3ChildrenDetails.tsx`

**What needs translation:**
- Card title & description
- "Do you have children?" question
- "Number of children" input
- "Add Child" / "Remove" buttons
- Child field labels (Full Name, Date of Birth, etc.)
- "Is this child a US Citizen or LPR?" question
- Validation messages

---

### 🔲 Step 4: Document Upload
**File:** `src/components/registration/steps/Step4DocumentUpload.tsx`

**What needs translation:**
- Card title & description
- "Important" notice
- Document type labels (Passport Photo, Passport Copy, etc.)
- Section headers (Applicant Documents, Spouse Documents, Child Documents)
- Upload UI text ("Drag and drop", "Uploading...", "Uploaded")
- Validation messages

---

### 🔲 Step 5: Review & Submit
**File:** `src/components/registration/steps/Step5Review.tsx`

**What needs translation:**
- Card title & description
- Section headers (Applicant Information, Marital Status, etc.)
- All field labels in review
- Document counts ("X uploaded")
- Disclaimer text
- Submit button
- Success/error messages
- "Start Fresh Registration" button

---

## 🛠️ Implementation Steps (For Each Component)

### 1. **Import the hook:**
```tsx
import { useRegistrationLanguage } from "@/contexts/RegistrationLanguageContext";
```

### 2. **Use the hook in your component:**
```tsx
export function YourComponent() {
  const { t, isRTL } = useRegistrationLanguage();
  
  // t = translations object
  // isRTL = true if Hebrew selected
}
```

### 3. **Replace hard-coded text:**

**Before:**
```tsx
<Label>First Name *</Label>
```

**After:**
```tsx
<Label>
  {t.step1.firstName} {t.common.required}
</Label>
```

### 4. **Replace placeholders:**

**Before:**
```tsx
<Input placeholder="Enter first name" />
```

**After:**
```tsx
<Input placeholder={t.step1.placeholders.firstName} />
```

### 5. **Handle arrays (like marital status options):**

**Before:**
```tsx
const statuses = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
];
```

**After:**
```tsx
const statuses = [
  { value: "single", label: t.step2.statuses.single },
  { value: "married", label: t.step2.statuses.married },
];
```

### 6. **RTL Considerations:**

For Hebrew (RTL), some CSS adjustments may be needed:
```tsx
<div className={isRTL ? "text-right" : "text-left"}>
```

But most alignment should work automatically with `dir="rtl"` set on the root element.

---

## 📚 Translation Key Structure

### Available Translation Keys:

```typescript
t.title                          // "DV Lottery Registration"
t.subtitle                       // "Complete your Diversity Visa..."
t.authenticatedBadge            // "Authenticated User"

// Common
t.common.required               // "*"
t.common.back                   // "Back"
t.common.continue               // "Continue"
t.common.yes                    // "Yes"
t.common.no                     // "No"
t.common.male                   // "Male"
t.common.female                 // "Female"

// Steps
t.steps.applicantInfo          // "Applicant Info"
t.steps.maritalStatus          // "Marital Status"
// ... etc

// Step 1
t.step1.title                  // "Applicant Information"
t.step1.firstName              // "First Name"
t.step1.lastName               // "Last Name"
t.step1.email                  // "Email"
t.step1.placeholders.firstName // "Enter first name"
t.step1.educationLevels.bachelor // "Bachelor's Degree"
// ... etc

// Step 2
t.step2.title                  // "Marital Status & Spouse Info"
t.step2.maritalStatus          // "Marital Status"
t.step2.statuses.single        // "Single"
t.step2.statuses.married       // "Married"
t.step2.spouseFullName         // "Full Name"
// ... etc

// Step 3
t.step3.title                  // "Children Information"
t.step3.question               // "Do you have any children...?"
t.step3.numberOfChildren       // "How many children...?"
t.step3.addChild               // "Add Child"
// ... etc

// Step 4
t.step4.title                  // "Document Upload"
t.step4.important              // "Important"
t.step4.documents.photo        // "Passport Photo"
t.step4.documents.passport     // "Passport Copy"
t.step4.dropzone               // "Drag and drop file here..."
// ... etc

// Step 5
t.step5.title                  // "Review & Submit"
t.step5.sections.applicantInfo // "Applicant Information"
t.step5.labels.fullName        // "Full Name"
t.step5.disclaimerText         // "By submitting this application..."
t.step5.submitButton           // "Submit Application"
t.step5.alreadySubmitted       // "A registration with this email..."
// ... etc

// Footer
t.footer.company               // "DRSI Law"
t.footer.tagline               // "Immigration Lottery Registration Services"
t.footer.needHelp              // "Need help? Contact us at"
t.footer.copyright             // "© 2025 DRSI Law..."

// Validation
t.validation.required          // "This field is required"
t.validation.email             // "Please enter a valid email"
// ... etc
```

---

## 🎨 RTL (Right-to-Left) Support

### Automatic RTL:
- ✅ Document direction (`<html dir="rtl">`) is set automatically
- ✅ Text alignment flips automatically
- ✅ Flexbox/Grid layouts reverse automatically

### Manual RTL adjustments (if needed):
```tsx
const { isRTL } = useRegistrationLanguage();

<div className={isRTL ? "rtl-specific-class" : "ltr-specific-class"}>
```

---

## 🧪 Testing Checklist

### Language Switching:
- [ ] Click English → All text shows in English
- [ ] Click Hebrew → All text shows in Hebrew (עברית)
- [ ] Refresh page → Language persists
- [ ] Complete registration in English → Works
- [ ] Complete registration in Hebrew → Works

### RTL Layout:
- [ ] Hebrew text aligns right
- [ ] Forms display correctly in RTL
- [ ] Progress indicator reads right-to-left
- [ ] Buttons are properly positioned

### Translation Completeness:
- [ ] All headers translated
- [ ] All field labels translated
- [ ] All placeholders translated
- [ ] All buttons translated
- [ ] All error messages translated
- [ ] All validation messages translated

---

## 📝 Example: Full Component Implementation

Here's how to update `Step1ApplicantInfo.tsx`:

```tsx
"use client";

import { useRegistrationLanguage } from "@/contexts/RegistrationLanguageContext";
// ... other imports

export function Step1ApplicantInfo() {
  const { t, isRTL } = useRegistrationLanguage();
  // ... other hooks
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.step1.title}</CardTitle>
        <CardDescription>{t.step1.subtitle}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form>
          {/* Contact Information */}
          <div className="space-y-4">
            <h3>{t.step1.contactInfo}</h3>
            
            <div className="space-y-2">
              <Label>
                {t.step1.firstName} {t.common.required}
              </Label>
              <Input
                placeholder={t.step1.placeholders.firstName}
                {...register("firstName")}
              />
            </div>
            
            {/* ... more fields */}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline">
              {t.common.back}
            </Button>
            <Button type="submit">
              {t.common.continue}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## 🚀 Current Status

### ✅ Phase 1: Infrastructure (COMPLETE)
- [x] Translation files created
- [x] Language context created
- [x] Language switcher component
- [x] Provider integration
- [x] Header/footer/progress translated

### 🔄 Phase 2: Step Components (IN PROGRESS)
- [ ] Step 1: Applicant Info
- [ ] Step 2: Marital Status
- [ ] Step 3: Children
- [ ] Step 4: Documents
- [ ] Step 5: Review

### 📋 Phase 3: Polish (TODO)
- [ ] RTL layout adjustments (if needed)
- [ ] Full testing in both languages
- [ ] Validation message translations
- [ ] Success/error page translations

---

## 🎯 Benefits of This System

1. **Centralized Translations:** All text in one place
2. **Type-Safe:** TypeScript ensures you use correct keys
3. **Easy Maintenance:** Change translation in one place, updates everywhere
4. **RTL Support:** Hebrew displays correctly right-to-left
5. **User Preference:** Language choice persists across sessions
6. **Professional:** Proper localization for international users
7. **Scalable:** Easy to add more languages in the future

---

## 📞 Support

If you need help implementing translations in a specific component, refer to:
- **Translation Keys:** `src/lib/i18n/registrationTranslations.ts`
- **Context Hook:** `src/contexts/RegistrationLanguageContext.tsx`
- **Example Usage:** `src/components/registration/RegistrationWizard.tsx`

---

**Created:** December 2024  
**Author:** AI Assistant  
**Status:** Phase 1 Complete ✅

