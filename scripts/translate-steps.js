#!/usr/bin/env node

/**
 * Quick Translation Script for Registration Steps
 * Adds translation support to all step components
 */

const fs = require('fs');
const path = require('path');

const stepsDir = path.join(__dirname, '..', 'src', 'components', 'registration', 'steps');

// Common replacements for all steps
const commonReplacements = {
  // Import
  'from "@/stores/registrationFormStore";': 'from "@/stores/registrationFormStore";\nimport { useRegistrationLanguage } from "@/contexts/RegistrationLanguageContext";',
  
  // Hook
  'useRegistrationFormStore();': 'useRegistrationFormStore();\n  const { t } = useRegistrationLanguage();',
  
  // Common elements
  '<span className="text-red-500">*</span>': '<span className="text-red-500">{t.common.required}</span>',
  '>Back<': '>{t.common.back}<',
  '>Continue<': '>{t.common.continue}<',
  
  // Male/Female
  '"male">Male<': `"male">{t.common.male}<`,
  '"female">Female<': `"female">{t.common.female}<`,
  
  // Yes/No
  '>Yes<': '>{t.common.yes}<',
  '>No<': '>{t.common.no}<',
};

// Step 1 specific
const step1Replacements = {
  '"text-2xl">Applicant Information<': '"text-2xl">{t.step1.title}<',
  'text-gray-100">\n          Please provide your personal details': 'text-gray-100">\n          {t.step1.subtitle}',
  'Personal Information\n            </h3>': '{t.step1.personalInfo}\n            </h3>',
  'htmlFor="firstName">\n                  First Name': 'htmlFor="firstName">\n                  {t.step1.firstName}',
  'htmlFor="lastName">\n                  Last Name': 'htmlFor="lastName">\n                  {t.step1.lastName}',
  'htmlFor="email">\n                  Email Address': 'htmlFor="email">\n                  {t.step1.email}',
  'htmlFor="phone">\n                  Phone Number': 'htmlFor="phone">\n                  {t.step1.phone}',
  'Date of Birth': '{t.step1.dateOfBirth}',
  'placeholder="Enter first name"': 'placeholder={t.step1.placeholders.firstName}',
  'placeholder="Enter last name"': 'placeholder={t.step1.placeholders.lastName}',
  'placeholder="email@example.com"': 'placeholder={t.step1.placeholders.email}',
  'placeholder="+1234567890"': 'placeholder={t.step1.placeholders.phone}',
  'placeholder="Day"': 'placeholder={t.common.day}',
  'placeholder="Month"': 'placeholder={t.common.month}',
  'placeholder="Year"': 'placeholder={t.common.year}',
  'Gender': '{t.step1.gender}',
  'City of Birth': '{t.step1.cityOfBirth}',
  'Country of Birth': '{t.step1.countryOfBirth}',
  'Mailing Address': '{t.step1.mailingAddress}',
  'Education\n            </h3>': '{t.step1.education}\n            </h3>',
  'Education Level': '{t.step1.educationLevel}',
  'Current Residence\n            </h3>': '{t.step1.currentResidence}\n            </h3>',
  'Street Address': '{t.step1.streetAddress}',
  'Street Address Line 2': '{t.step1.streetAddress2}',
  'City': '{t.step1.city}',
  'State/Province': '{t.step1.stateProvince}',
  'Postal/Zip Code': '{t.step1.postalCode}',
  'placeholder="Enter street address"': 'placeholder={t.step1.placeholders.streetAddress}',
  'placeholder="Apartment, suite, unit, building, floor, etc."': 'placeholder={t.step1.streetAddress2Placeholder}',
  'placeholder="Enter city"': 'placeholder={t.step1.placeholders.city}',
  'placeholder="Enter state or province"': 'placeholder={t.step1.placeholders.stateProvince}',
  'placeholder="Enter postal or zip code"': 'placeholder={t.step1.placeholders.postalCode}',
};

// Step 2 specific
const step2Replacements = {
  '"text-2xl">Marital Status & Spouse Information<': '"text-2xl">{t.step2.title}<',
  'text-gray-100">\n          Please provide your marital status': 'text-gray-100">\n          {t.step2.subtitle}',
  'Marital Status': '{t.step2.maritalStatus}',
  'Select your marital status': '{t.step2.selectMaritalStatus}',
  'Spouse Information': '{t.step2.spouseInfo}',
  'Full Name': '{t.step2.spouseFullName}',
  'Is your spouse a U.S. Citizen or Green Card Holder?': '{t.step2.spouseUSCitizen}',
};

// Step 3 specific
const step3Replacements = {
  '"text-2xl">Children Information<': '"text-2xl">{t.step3.title}<',
  'Do you have any children under 21': '{t.step3.question}',
  'How many children': '{t.step3.numberOfChildren}',
  'Add Child': '{t.step3.addChild}',
  'Remove': '{t.step3.removeChild}',
  'Is this child a U.S. Citizen or LPR?': '{t.step3.isUSCitizen}',
};

// Step 4 specific  
const step4Replacements = {
  '"text-2xl">Document Upload<': '"text-2xl">{t.step4.title}<',
  'Important': '{t.step4.important}',
  'All documents must be uploaded': '{t.step4.importantNote}',
  'Main Applicant Documents': '{t.step4.applicantDocuments}',
  'Spouse Documents': '{t.step4.spouseDocuments}',
  'Passport Photo': '{t.step4.documents.photo}',
  'Passport Copy': '{t.step4.documents.passport}',
  'Education Certificate': '{t.step4.documents.education}',
  'Marriage Certificate': '{t.step4.documents.marriage}',
  'Birth Certificate': '{t.step4.documents.birth}',
};

// Step 5 specific
const step5Replacements = {
  '"text-2xl">Review & Submit<': '"text-2xl">{t.step5.title}<',
  'Applicant Information': '{t.step5.sections.applicantInfo}',
  'Marital Status': '{t.step5.sections.maritalStatus}',
  'Spouse Information': '{t.step5.sections.spouseInfo}',
  'Children': '{t.step5.sections.children}',
  'Documents Uploaded': '{t.step5.sections.documents}',
  'Submit Application': '{t.step5.submitButton}',
  'By submitting this application': '{t.step5.disclaimerText}',
};

function applyReplacements(content, replacements) {
  let updated = content;
  for (const [find, replace] of Object.entries(replacements)) {
    updated = updated.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
  }
  return updated;
}

// Process each step file
const files = {
  'Step1ApplicantInfo.tsx': { ...commonReplacements, ...step1Replacements },
  'Step2MaritalStatus.tsx': { ...commonReplacements, ...step2Replacements },
  'Step3ChildrenDetails.tsx': { ...commonReplacements, ...step3Replacements },
  'Step4DocumentUpload.tsx': { ...commonReplacements, ...step4Replacements },
  'Step5Review.tsx': { ...commonReplacements, ...step5Replacements },
};

console.log('🌐 Starting translation updates...\n');

for (const [filename, replacements] of Object.entries(files)) {
  const filepath = path.join(stepsDir, filename);
  
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    const original = content;
    
    content = applyReplacements(content, replacements);
    
    if (content !== original) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`✅ Updated: ${filename}`);
    } else {
      console.log(`⏭️  No changes: ${filename}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

console.log('\n✨ Translation updates complete!');

