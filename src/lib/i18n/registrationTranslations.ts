export const registrationTranslations = {
  en: {
    // Header
    title: "DV Lottery Registration",
    subtitle: "Complete your Diversity Visa Lottery application",
    authenticatedBadge: "Authenticated User",

    // Progress
    progress: {
      step: "Step",
      of: "of",
    },

    // Steps
    steps: {
      applicantInfo: "Applicant Info",
      maritalStatus: "Marital Status",
      children: "Children",
      documents: "Documents",
      review: "Review",
    },

    // Common
    common: {
      required: "*",
      back: "Back",
      continue: "Continue",
      submit: "Submit Application",
      loading: "Loading...",
      saving: "Saving...",
      submitting: "Submitting...",
      yes: "Yes",
      no: "No",
      optional: "Optional",
      select: "Select",
      male: "Male",
      female: "Female",
      day: "Day",
      month: "Month",
      year: "Year",
    },

    // Step 1: Applicant Information
    step1: {
      title: "Applicant Information",
      subtitle: "Please provide your personal information",
      
      // Contact Info Section
      contactInfo: "Contact Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      
      // Personal Info Section
      personalInfo: "Personal Information",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      cityOfBirth: "City of Birth",
      countryOfBirth: "Country of Birth",
      mailingAddress: "Mailing Address",
      
      // Current Residence Section
      currentResidence: "Current Residence",
      streetAddress: "Street Address",
      streetAddress2: "Street Address Line 2",
      streetAddress2Placeholder: "Apartment, suite, unit, building, floor, etc.",
      city: "City",
      stateProvince: "State/Province",
      postalCode: "Postal/Zip Code",
      
      // Education Section
      education: "Education",
      educationLevel: "Education Level",
      educationLevels: {
        primary: "Primary Education",
        highSchoolNoDegree: "High School (No Degree)",
        highSchool: "High School Diploma",
        vocational: "Vocational / Technical Certificate",
        someCollege: "Some College (No Degree)",
        associate: "Associate Degree",
        bachelor: "Bachelor's Degree",
        master: "Master's Degree",
        doctorate: "Doctorate / PhD",
      },
      educationAlert: "⚠️ Important: Applicants with only Primary or High School (No Degree) education must have at least 2 years of work experience.",
      
      // Placeholders
      placeholders: {
        firstName: "Enter first name",
        lastName: "Enter last name",
        email: "Enter email address",
        phone: "Enter phone number",
        cityOfBirth: "Enter city of birth",
        countryOfBirth: "Select country",
        mailingAddress: "Enter complete mailing address",
        streetAddress: "Enter street address",
        city: "Enter city",
        stateProvince: "Enter state or province",
        postalCode: "Enter postal or zip code",
        educationLevel: "Select education level",
      },
    },

    // Step 2: Marital Status & Spouse
    step2: {
      title: "Marital Status & Spouse Information",
      subtitle: "Please provide your marital status and spouse details if applicable",
      
      maritalStatus: "Marital Status",
      selectMaritalStatus: "Select your marital status",
      
      statuses: {
        single: "Single",
        married: "Married",
        divorced: "Divorced",
        widowed: "Widowed",
        separated: "Legally Separated",
      },
      
      // Spouse Section
      spouseInfo: "Spouse Information",
      spouseFullName: "Full Name",
      spouseDateOfBirth: "Date of Birth",
      spouseGender: "Gender",
      spouseCityOfBirth: "City of Birth",
      spouseCountryOfBirth: "Country of Birth",
      spouseEducation: "Education Level",
      spouseUSCitizen: "Is your spouse a U.S. Citizen or Green Card Holder?",
      
      placeholders: {
        fullName: "Enter spouse's full name",
        cityOfBirth: "Enter spouse's city of birth",
        countryOfBirth: "Select country",
        educationLevel: "Select education level",
      },
    },

    // Step 3: Children Details
    step3: {
      title: "Children Information",
      subtitle: "Please provide information about your children under 21 years old",
      
      question: "Do you have any children under 21 years old?",
      numberOfChildren: "How many children do you have under 21?",
      addChild: "Add Child",
      removeChild: "Remove",
      
      childNumber: "Child",
      fullName: "Full Name",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      cityOfBirth: "City of Birth",
      countryOfBirth: "Country of Birth",
      isUSCitizen: "Is this child a U.S. Citizen or LPR?",
      
      placeholders: {
        fullName: "Enter child's full name",
        cityOfBirth: "Enter city of birth",
        countryOfBirth: "Select country",
      },
    },

    // Step 4: Document Upload
    step4: {
      title: "Document Upload",
      subtitle: "Please upload all required documents",
      
      important: "Important",
      importantNote: "All documents must be uploaded before submission. Supported formats: PDF, JPG, PNG (Max 10MB per file)",
      
      // Applicant Section
      applicantDocuments: "Main Applicant Documents",
      
      // Spouse Section
      spouseDocuments: "Spouse Documents",
      
      // Children Section
      childDocuments: "Child Documents",
      
      // Document Types
      documents: {
        photo: "Passport Photo",
        passport: "Passport Copy",
        education: "Education Certificate",
        marriage: "Marriage Certificate",
        birth: "Birth Certificate",
      },
      
      // Upload
      dropzone: "Drag and drop file here, or click to select",
      uploading: "Uploading...",
      uploaded: "Uploaded",
      remove: "Remove",
      
      // Validation
      allRequired: "All documents are required",
      fileSize: "File size must be less than 10MB",
      fileType: "Only PDF, JPG, PNG files are allowed",
    },

    // Step 5: Review & Submit
    step5: {
      title: "Review & Submit",
      subtitle: "Please review all information before submitting",
      
      sections: {
        applicantInfo: "Applicant Information",
        maritalStatus: "Marital Status",
        spouseInfo: "Spouse Information",
        children: "Children",
        documents: "Documents Uploaded",
      },
      
      labels: {
        fullName: "Full Name",
        email: "Email",
        phone: "Phone",
        dateOfBirth: "Date of Birth",
        gender: "Gender",
        birthPlace: "Birth Place",
        mailingAddress: "Mailing Address",
        currentResidence: "Current Residence",
        streetAddress: "Street Address",
        streetAddress2: "Street Address Line 2",
        city: "City",
        stateProvince: "State/Province",
        postalCode: "Postal/Zip Code",
        educationLevel: "Education Level",
        status: "Status",
        usCitizenOrLPR: "U.S. Citizen or Green Card Holder",
        noChildren: "No children under 21",
        applicant: "Applicant Documents",
        spouse: "Spouse Documents",
        uploaded: "uploaded",
      },
      
      disclaimer: "Important",
      disclaimerText: "By submitting this application, you confirm that all information provided is accurate and complete. False information may result in disqualification from the DV Lottery program.",
      
      submitButton: "Submit Application",
      backButton: "Back",
      
      // Success
      success: "Registration Submitted Successfully!",
      successMessage: "Your registration has been submitted. You will receive a confirmation email shortly.",
      
      // Errors
      alreadySubmitted: "A registration with this email or phone number has already been submitted.",
      submissionFailed: "Submission failed. Please check your internet connection and try again. If the problem persists, contact support.",
      startFresh: "Start Fresh Registration",
    },

    // Footer
    footer: {
      company: "DRSI Law",
      tagline: "Immigration Lottery Registration Services",
      needHelp: "Need help? Contact us at",
      or: "or via WhatsApp:",
      copyright: "© 2025 DRSI Law. All rights reserved.",
    },

    // Validation Messages
    validation: {
      required: "This field is required",
      email: "Please enter a valid email address",
      phone: "Please enter a valid phone number",
      dateInvalid: "Please enter a valid date",
      minLength: "Minimum {min} characters required",
      maxLength: "Maximum {max} characters allowed",
      selectOption: "Please select an option",
      uploadRequired: "Please upload all required documents",
    },
  },

  he: {
    // Header
    title: "רישום ללוטו הגירה DV",
    subtitle: "השלם את בקשת ויזת הגיוון שלך",
    authenticatedBadge: "משתמש מאומת",

    // Progress
    progress: {
      step: "שלב",
      of: "מתוך",
    },

    // Steps
    steps: {
      applicantInfo: "מידע אישי",
      maritalStatus: "מצב משפחתי",
      children: "ילדים",
      documents: "מסמכים",
      review: "סקירה",
    },

    // Common
    common: {
      required: "*",
      back: "חזור",
      continue: "המשך",
      submit: "שלח בקשה",
      loading: "טוען...",
      saving: "שומר...",
      submitting: "שולח...",
      yes: "כן",
      no: "לא",
      optional: "אופציונלי",
      select: "בחר",
      male: "זכר",
      female: "נקבה",
      day: "יום",
      month: "חודש",
      year: "שנה",
    },

    // Step 1: Applicant Information
    step1: {
      title: "מידע על המבקש",
      subtitle: "אנא ספק את המידע האישי שלך",
      
      // Contact Info Section
      contactInfo: "פרטי התקשרות",
      firstName: "שם פרטי",
      lastName: "שם משפחה",
      email: "דוא״ל",
      phone: "מספר טלפון",
      
      // Personal Info Section
      personalInfo: "מידע אישי",
      dateOfBirth: "תאריך לידה",
      gender: "מין",
      cityOfBirth: "עיר לידה",
      countryOfBirth: "מדינת לידה",
      mailingAddress: "כתובת למשלוח דואר",
      
      // Current Residence Section
      currentResidence: "מקום מגורים נוכחי",
      streetAddress: "כתובת רחוב",
      streetAddress2: "שורת כתובת 2",
      streetAddress2Placeholder: "דירה, יחידה, בניין, קומה וכו׳",
      city: "עיר",
      stateProvince: "מדינה/מחוז",
      postalCode: "מיקוד",
      
      // Education Section
      education: "השכלה",
      educationLevel: "רמת השכלה",
      educationLevels: {
        primary: "השכלה יסודית",
        highSchoolNoDegree: "תיכון (ללא תעודה)",
        highSchool: "תעודת בגרות",
        vocational: "תעודה מקצועית/טכנית",
        someCollege: "לימודים אקדמיים חלקיים",
        associate: "תואר אסוציאט",
        bachelor: "תואר ראשון",
        master: "תואר שני",
        doctorate: "דוקטורט",
      },
      educationAlert: "⚠️ חשוב: מבקשים עם השכלה יסודית או תיכון בלבד (ללא תעודה) חייבים להיות בעלי לפחות שנתיים של ניסיון עבודה.",
      
      // Placeholders
      placeholders: {
        firstName: "הזן שם פרטי",
        lastName: "הזן שם משפחה",
        email: "הזן כתובת דוא״ל",
        phone: "הזן מספר טלפון",
        cityOfBirth: "הזן עיר לידה",
        countryOfBirth: "בחר מדינה",
        mailingAddress: "הזן כתובת מלאה למשלוח דואר",
        streetAddress: "הזן כתובת רחוב",
        city: "הזן עיר",
        stateProvince: "הזן מדינה או מחוז",
        postalCode: "הזן מיקוד",
        educationLevel: "בחר רמת השכלה",
      },
    },

    // Step 2: Marital Status & Spouse
    step2: {
      title: "מצב משפחתי ומידע על בן/בת זוג",
      subtitle: "אנא ספק את המצב המשפחתי שלך ופרטי בן/בת הזוג במידת הצורך",
      
      maritalStatus: "מצב משפחתי",
      selectMaritalStatus: "בחר את המצב המשפחתי שלך",
      
      statuses: {
        single: "רווק/ה",
        married: "נשוי/אה",
        divorced: "גרוש/ה",
        widowed: "אלמן/ה",
        separated: "פרוד/ה על פי חוק",
      },
      
      // Spouse Section
      spouseInfo: "מידע על בן/בת הזוג",
      spouseFullName: "שם מלא",
      spouseDateOfBirth: "תאריך לידה",
      spouseGender: "מין",
      spouseCityOfBirth: "עיר לידה",
      spouseCountryOfBirth: "מדינת לידה",
      spouseEducation: "רמת השכלה",
      spouseUSCitizen: "האם בן/בת זוגך הוא/היא אזרח/ית ארה״ב או בעל/ת גרין קארד?",
      
      placeholders: {
        fullName: "הזן שם מלא של בן/בת הזוג",
        cityOfBirth: "הזן עיר לידה של בן/בת הזוג",
        countryOfBirth: "בחר מדינה",
        educationLevel: "בחר רמת השכלה",
      },
    },

    // Step 3: Children Details
    step3: {
      title: "מידע על ילדים",
      subtitle: "אנא ספק מידע על ילדיך מתחת לגיל 21",
      
      question: "האם יש לך ילדים מתחת לגיל 21?",
      numberOfChildren: "כמה ילדים יש לך מתחת לגיל 21?",
      addChild: "הוסף ילד",
      removeChild: "הסר",
      
      childNumber: "ילד",
      fullName: "שם מלא",
      dateOfBirth: "תאריך לידה",
      gender: "מין",
      cityOfBirth: "עיר לידה",
      countryOfBirth: "מדינת לידה",
      isUSCitizen: "האם הילד הזה הוא אזרח ארה״ב או LPR?",
      
      placeholders: {
        fullName: "הזן שם מלא של הילד",
        cityOfBirth: "הזן עיר לידה",
        countryOfBirth: "בחר מדינה",
      },
    },

    // Step 4: Document Upload
    step4: {
      title: "העלאת מסמכים",
      subtitle: "אנא העלה את כל המסמכים הנדרשים",
      
      important: "חשוב",
      importantNote: "יש להעלות את כל המסמכים לפני ההגשה. פורמטים נתמכים: PDF, JPG, PNG (מקסימום 10MB לכל קובץ)",
      
      // Applicant Section
      applicantDocuments: "מסמכי המבקש הראשי",
      
      // Spouse Section
      spouseDocuments: "מסמכי בן/בת הזוג",
      
      // Children Section
      childDocuments: "מסמכי הילד",
      
      // Document Types
      documents: {
        photo: "תמונת דרכון",
        passport: "העתק דרכון",
        education: "תעודת השכלה",
        marriage: "תעודת נישואין",
        birth: "תעודת לידה",
      },
      
      // Upload
      dropzone: "גרור ושחרר קובץ כאן, או לחץ לבחירה",
      uploading: "מעלה...",
      uploaded: "הועלה",
      remove: "הסר",
      
      // Validation
      allRequired: "כל המסמכים נדרשים",
      fileSize: "גודל הקובץ חייב להיות פחות מ-10MB",
      fileType: "רק קבצי PDF, JPG, PNG מותרים",
    },

    // Step 5: Review & Submit
    step5: {
      title: "סקירה והגשה",
      subtitle: "אנא עיין בכל המידע לפני ההגשה",
      
      sections: {
        applicantInfo: "מידע על המבקש",
        maritalStatus: "מצב משפחתי",
        spouseInfo: "מידע על בן/בת הזוג",
        children: "ילדים",
        documents: "מסמכים שהועלו",
      },
      
      labels: {
        fullName: "שם מלא",
        email: "דוא״ל",
        phone: "טלפון",
        dateOfBirth: "תאריך לידה",
        gender: "מין",
        birthPlace: "מקום לידה",
        mailingAddress: "כתובת למשלוח דואר",
        currentResidence: "מקום מגורים נוכחי",
        streetAddress: "כתובת רחוב",
        streetAddress2: "שורת כתובת 2",
        city: "עיר",
        stateProvince: "מדינה/מחוז",
        postalCode: "מיקוד",
        educationLevel: "רמת השכלה",
        status: "סטטוס",
        usCitizenOrLPR: "אזרח ארה״ב או בעל גרין קארד",
        noChildren: "אין ילדים מתחת לגיל 21",
        applicant: "מסמכי המבקש",
        spouse: "מסמכי בן/בת הזוג",
        uploaded: "הועלו",
      },
      
      disclaimer: "חשוב",
      disclaimerText: "בהגשת בקשה זו, אתה מאשר שכל המידע שסופק הוא מדויק ושלם. מידע כוזב עלול לגרום לפסילה מתוכנית לוטו ה-DV.",
      
      submitButton: "שלח בקשה",
      backButton: "חזור",
      
      // Success
      success: "הרישום נשלח בהצלחה!",
      successMessage: "הרישום שלך נשלח. תקבל אימייל אישור בקרוב.",
      
      // Errors
      alreadySubmitted: "רישום עם כתובת דוא״ל או מספר טלפון זה כבר הוגש.",
      submissionFailed: "ההגשה נכשלה. אנא בדוק את חיבור האינטרנט שלך ונסה שוב. אם הבעיה נמשכת, צור קשר עם התמיכה.",
      startFresh: "התחל רישום חדש",
    },

    // Footer
    footer: {
      company: "DRSI Law",
      tagline: "שירותי רישום ללוטו הגירה",
      needHelp: "צריך עזרה? צור קשר בכתובת",
      or: "או דרך WhatsApp:",
      copyright: "© 2025 DRSI Law. כל הזכויות שמורות.",
    },

    // Validation Messages
    validation: {
      required: "שדה זה הוא חובה",
      email: "אנא הזן כתובת דוא״ל חוקית",
      phone: "אנא הזן מספר טלפון חוקי",
      dateInvalid: "אנא הזן תאריך חוקי",
      minLength: "נדרש מינימום {min} תווים",
      maxLength: "מקסימום {max} תווים מותר",
      selectOption: "אנא בחר אפשרות",
      uploadRequired: "אנא העלה את כל המסמכים הנדרשים",
    },
  },
};

export type RegistrationLanguage = keyof typeof registrationTranslations;
export type RegistrationTranslationKey = typeof registrationTranslations.en;

