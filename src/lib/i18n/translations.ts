export const translations = {
  en: {
    // Header
    companyName: "DRSI Law",
    subtitle: "Immigration Lottery Registration",
    
    // Steps
    steps: {
      contactInfo: "Contact Info",
      pricing: "Pricing",
      contract: "Contract",
      payment: "Payment",
    },
    
    // Step 1: Contact Info
    step1: {
      title: "Contact Information",
      description: "Please provide your contact details to get started",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      continue: "Continue",
      required: "*",
    },
    
    // Step 2: Marital Status
    step2: {
      title: "Marital Status & Pricing",
      description: "Select your marital status to see the pricing for your application",
      maritalStatus: "Marital Status",
      selectPlaceholder: "Select your marital status",
      pricingBreakdown: "Pricing Breakdown",
      serviceFee: "Service Fee:",
      govFee: "Government Fee:",
      total: "Total:",
      doubleChance: "Double Chance Registration",
      doubleChanceDesc: "Includes registration for both husband and wife",
      back: "Back",
      continue: "Continue to Contract",
      
      // Marital Status Options
      statuses: {
        single: "Single",
        married: "Married",
        marriedToCitizen: "Married to US Citizen / Legal Resident",
        divorced: "Divorced",
        widowed: "Widowed",
        legallySeparated: "Legally Separated",
      },
    },
    
    // Step 3: Contract
    step3: {
      title: "Service Agreement",
      description: "Please review the agreement and provide your signature",
      clientInfo: "Client Information:",
      agree: "I have read and agree to the terms and conditions of this Service Agreement",
      signature: "Your Signature",
      clear: "Clear",
      signPrompt: "Please sign above using your mouse or touchscreen",
      back: "Back",
      continue: "Continue to Payment",
    },
    
    // Step 4: Payment
    step4: {
      title: "Summary & Payment",
      description: "Review your information and complete payment",
      contactInfo: "Contact Information",
      name: "Name:",
      email: "Email:",
      phone: "Phone:",
      paymentBreakdown: "Payment Breakdown",
      serviceFee: "Service Fee",
      serviceFeeDesc: "Professional consultation & application preparation",
      govFee: "Government Fee",
      govFeeDesc: "Statutory filing fee",
      totalAmount: "Total Amount",
      contractSigned: "Contract signed and ready for processing",
      securePayment: "Secure Payment:",
      securePaymentDesc: "You will be redirected to Stripe's secure checkout page to complete your payment. All transactions are encrypted and secure.",
      back: "Back",
      pay: "Pay",
      processing: "Processing...",
    },
    
    // Success Page
    success: {
      title: "Payment Successful!",
      thankYou: "Thank you for choosing DRSI Law for your immigration lottery registration.",
      whatNext: "What Happens Next?",
      step1: "You will receive a confirmation email with your contract and next steps within the next few minutes.",
      step2: "Check your email inbox (and spam folder) for important information about your registration.",
      step3: "Complete the detailed registration form using the link provided in your email.",
      step4: "Our team will review your application and submit it to the appropriate authorities.",
      docsSafe: "Your Documents Are Safe",
      docsSafeDesc: "Your signed contract has been securely stored and a copy has been sent to your email address.",
      transactionId: "Transaction ID:",
      returnHome: "Return to Home",
      contactSupport: "Contact Support",
      needHelp: "Need help? Call us at",
    },
    
    // Footer
    footer: {
      copyright: "© 2025 DRSI Law. All rights reserved.",
      support: "Need help? Contact us at",
    },
    
    // Validation Messages
    validation: {
      firstNameMin: "First name must be at least 2 characters",
      firstNameMax: "First name must be less than 50 characters",
      lastNameMin: "Last name must be at least 2 characters",
      lastNameMax: "Last name must be less than 50 characters",
      emailInvalid: "Please enter a valid email address",
      phoneInvalid: "Please enter a valid phone number",
      maritalStatusRequired: "Please select your marital status",
      agreeRequired: "You must agree to the terms and conditions",
      signatureRequired: "Signature is required",
    },
  },
  
  he: {
    // Header
    companyName: "DRSI Law",
    subtitle: "רישום ללוטו הגירה",
    
    // Steps
    steps: {
      contactInfo: "פרטי קשר",
      pricing: "תמחור",
      contract: "חוזה",
      payment: "תשלום",
    },
    
    // Step 1: Contact Info
    step1: {
      title: "פרטי התקשרות",
      description: "אנא הזן את פרטי הקשר שלך כדי להתחיל",
      firstName: "שם פרטי",
      lastName: "שם משפחה",
      email: "דוא״ל",
      phone: "מספר טלפון",
      continue: "המשך",
      required: "*",
    },
    
    // Step 2: Marital Status
    step2: {
      title: "מצב משפחתי ותמחור",
      description: "בחר את המצב המשפחתי שלך כדי לראות את התמחור עבור הבקשה שלך",
      maritalStatus: "מצב משפחתי",
      selectPlaceholder: "בחר את המצב המשפחתי שלך",
      pricingBreakdown: "פירוט מחירים",
      serviceFee: "עמלת שירות:",
      govFee: "אגרת ממשלה:",
      total: "סה״כ:",
      doubleChance: "רישום כפול",
      doubleChanceDesc: "כולל רישום לבעל ולאישה",
      back: "חזור",
      continue: "המשך לחוזה",
      
      // Marital Status Options
      statuses: {
        single: "רווק/ה",
        married: "נשוי/אה",
        marriedToCitizen: "נשוי/אה לאזרח אמריקאי / תושב קבע",
        divorced: "גרוש/ה",
        widowed: "אלמן/ה",
        legallySeparated: "פרוד/ה על פי חוק",
      },
    },
    
    // Step 3: Contract
    step3: {
      title: "הסכם שירות",
      description: "אנא עיין בהסכם וספק את חתימתך",
      clientInfo: "פרטי לקוח:",
      agree: "קראתי ואני מסכים/ה לתנאים וההגבלות של הסכם שירות זה",
      signature: "החתימה שלך",
      clear: "נקה",
      signPrompt: "אנא חתום למעלה באמצעות העכבר או מסך המגע",
      back: "חזור",
      continue: "המשך לתשלום",
    },
    
    // Step 4: Payment
    step4: {
      title: "סיכום ותשלום",
      description: "בדוק את המידע שלך והשלם את התשלום",
      contactInfo: "פרטי התקשרות",
      name: "שם:",
      email: "דוא״ל:",
      phone: "טלפון:",
      paymentBreakdown: "פירוט תשלום",
      serviceFee: "עמלת שירות",
      serviceFeeDesc: "ייעוץ מקצועי והכנת בקשה",
      govFee: "אגרת ממשלה",
      govFeeDesc: "אגרת הגשה חובה",
      totalAmount: "סכום כולל",
      contractSigned: "החוזה נחתם ומוכן לעיבוד",
      securePayment: "תשלום מאובטח:",
      securePaymentDesc: "תועבר לעמוד התשלום המאובטח של Stripe כדי להשלים את התשלום שלך. כל העסקאות מוצפנות ומאובטחות.",
      back: "חזור",
      pay: "שלם",
      processing: "מעבד...",
    },
    
    // Success Page
    success: {
      title: "תשלום בוצע בהצלחה!",
      thankYou: "תודה שבחרת ב-DRSI Law עבור רישום ללוטו ההגירה שלך.",
      whatNext: "מה קורה הלאה?",
      step1: "תקבל אימייל אישור עם החוזה שלך והשלבים הבאים תוך מספר דקות.",
      step2: "בדוק את תיבת הדואר הנכנס שלך (ותיקיית הספאם) למידע חשוב על הרישום שלך.",
      step3: "השלם את טופס הרישום המפורט באמצעות הקישור שנשלח באימייל.",
      step4: "הצוות שלנו יבדוק את הבקשה שלך וישלח אותה לרשויות המתאימות.",
      docsSafe: "המסמכים שלך מאובטחים",
      docsSafeDesc: "החוזה החתום שלך נשמר באופן מאובטח והעתק נשלח לכתובת הדואר האלקטרוני שלך.",
      transactionId: "מזהה עסקה:",
      returnHome: "חזור לדף הבית",
      contactSupport: "צור קשר עם התמיכה",
      needHelp: "צריך עזרה? התקשר אלינו בטלפון",
    },
    
    // Footer
    footer: {
      copyright: "© 2025 DRSI Law. כל הזכויות שמורות.",
      support: "צריך עזרה? צור קשר בכתובת",
    },
    
    // Validation Messages
    validation: {
      firstNameMin: "השם הפרטי חייב להכיל לפחות 2 תווים",
      firstNameMax: "השם הפרטי חייב להכיל פחות מ-50 תווים",
      lastNameMin: "שם המשפחה חייב להכיל לפחות 2 תווים",
      lastNameMax: "שם המשפחה חייב להכיל פחות מ-50 תווים",
      emailInvalid: "אנא הזן כתובת דואר אלקטרוני חוקית",
      phoneInvalid: "אנא הזן מספר טלפון חוקי",
      maritalStatusRequired: "אנא בחר את המצב המשפחתי שלך",
      agreeRequired: "עליך להסכים לתנאים וההגבלות",
      signatureRequired: "חתימה נדרשת",
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = typeof translations.en;

