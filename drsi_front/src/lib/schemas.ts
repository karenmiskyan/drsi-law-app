import { z } from 'zod';

// MM/DD/YYYY date format
const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
export const dateSchema = z
  .string()
  .regex(dateRegex, 'Date must be in MM/DD/YYYY format')
  .refine(
    (val) => {
      const [month, day, year] = val.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    },
    { message: 'Please enter a valid date' }
  );

// Additional phone/email for Step 1
const additionalPhoneSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  number: z.string().min(1, 'Phone number is required'),
});

// Step 1: Basic Information - shared person schema
// Name fields are split per Meir's feedback; `fullName` is kept as an auto-computed
// legacy field so all existing Filament/PDF/admin rendering code keeps working.
const basicPersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().default(''),
  surname: z.string().min(1, 'Surname is required'),
  fullName: z.string().optional(), // auto-composed from firstName+middleName+surname
  relationship: z.string().min(1, 'Relationship is required'),
  phoneCountryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  dateOfBirth: dateSchema,
  cityOfBirth: z.string().min(1, 'City of birth is required'),
  countryOfBirth: z.string().min(1, 'Country of birth is required'),
  socialSecurityNumber: z.string().regex(/^\d{9}$/, 'Must be exactly 9 digits').optional().or(z.literal('')),
  aNumber: z.string().regex(/^\d{9}$/, 'Must be exactly 9 digits').optional().or(z.literal('')),
  additionalPhones: z.array(additionalPhoneSchema).optional(),
  additionalEmails: z.array(z.union([z.string().email('Invalid email format'), z.literal('')])).optional(),
});

export const step1Schema = z.object({
  petitioner: basicPersonSchema,
  beneficiary: basicPersonSchema,
});

// Address schema (used in Step 2 - current address)
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  floorAptSuite: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  zip: z.string().min(1, 'ZIP/Postal code is required'),
  stateOrCountry: z.string().min(1, 'State/Country is required'),
  startDate: dateSchema,
  endDate: z.union([dateSchema, z.literal('')]).optional(),
});

// Previous address schema (includes required End Date)
export const previousAddressSchema = addressSchema.extend({
  endDate: dateSchema,
});

// Lived elsewhere entry (Step 2) — fields are optional at base level;
// required-ness is enforced via superRefine only when toggle is active
const livedElsewhereEntrySchema = z.object({
  country: z.string().optional().default(''),
  duration: z.string().optional().default(''),
});

// Future US Address schema (Step 2)
export const futureUSAddressSchema = z.object({
  nameOfPersonLiving: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  floorAptSuite: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  phoneCountryCode: z.string().min(1, 'Phone country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  isGreenCardDeliveryAddress: z.boolean(),
  contactPerson: z.string().optional(),
  contactStreet: z.string().optional(),
  contactFloorAptSuite: z.string().optional(),
  contactCity: z.string().optional(),
  contactState: z.string().optional(),
  contactZip: z.string().optional(),
  contactPhoneCountryCode: z.string().optional(),
  contactPhone: z.string().optional(),
}).refine(
  (data) => {
    if (data.isGreenCardDeliveryAddress) return true;
    return !!(
      data.contactPerson &&
      data.contactStreet &&
      data.contactCity &&
      data.contactState &&
      data.contactZip &&
      data.contactPhone
    );
  },
  {
    message: 'Contact person, full address, and phone are required when Green Card will not be delivered here',
    path: ['contactPerson'],
  }
);

// Step 2: Address History
export const step2Schema = z
  .object({
    petitioner: z.object({
      currentAddress: addressSchema,
      previousAddresses: z.array(previousAddressSchema),
      livedInOtherCountryOver6Months: z.boolean().optional(),
      livedInOtherCountryDetails: z.array(livedElsewhereEntrySchema).optional(),
    }),
    beneficiary: z.object({
      currentAddress: addressSchema,
      previousAddresses: z.array(previousAddressSchema),
      livedInOtherCountryOver6Months: z.boolean().optional(),
      livedInOtherCountryDetails: z.array(livedElsewhereEntrySchema).optional(),
    }),
    futureUSAddress: futureUSAddressSchema,
  })
  .superRefine((data, ctx) => {
    // Petitioner: validate lived-elsewhere entries ONLY when toggle is Yes
    if (data.petitioner?.livedInOtherCountryOver6Months === true) {
      const details = data.petitioner.livedInOtherCountryDetails ?? [];
      if (details.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least one country when you have lived elsewhere over 6 months',
          path: ['petitioner', 'livedInOtherCountryDetails'],
        });
      }
      details.forEach((entry, i) => {
        if (!entry.country?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Country is required',
            path: ['petitioner', 'livedInOtherCountryDetails', i, 'country'],
          });
        }
        if (!entry.duration?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Duration/how long is required',
            path: ['petitioner', 'livedInOtherCountryDetails', i, 'duration'],
          });
        }
      });
    }
    // Beneficiary MUST explicitly answer Yes/No (Meir: beneficiary section is now required with red asterisk)
    if (
      data.beneficiary?.livedInOtherCountryOver6Months !== true &&
      data.beneficiary?.livedInOtherCountryOver6Months !== false
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select Yes or No',
        path: ['beneficiary', 'livedInOtherCountryOver6Months'],
      });
    }
    // Beneficiary: validate lived-elsewhere entries ONLY when toggle is Yes
    if (data.beneficiary?.livedInOtherCountryOver6Months === true) {
      const details = data.beneficiary.livedInOtherCountryDetails ?? [];
      if (details.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least one country when you have lived elsewhere over 6 months',
          path: ['beneficiary', 'livedInOtherCountryDetails'],
        });
      }
      details.forEach((entry, i) => {
        if (!entry.country?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Country is required',
            path: ['beneficiary', 'livedInOtherCountryDetails', i, 'country'],
          });
        }
        if (!entry.duration?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Duration/how long is required',
            path: ['beneficiary', 'livedInOtherCountryDetails', i, 'duration'],
          });
        }
      });
    }
  });

// Marriage schema (Step 3)
export const marriageSchema = z.object({
  date: dateSchema,
  city: z.string().min(1, 'Marriage city is required'),
  country: z.string().min(1, 'Marriage country is required'),
  spouseName: z.string().min(1, 'Spouse name is required'),
  spouseDateOfBirth: z.union([dateSchema, z.literal('')]).optional(),
});

// Prior marriage fields are .optional() at base level;
// required-ness is enforced via superRefine only when timesMarried > 1
export const priorMarriageSchema = z.object({
  fullName: z.string().optional().default(''),
  dateOfBirth: z.union([dateSchema, z.literal('')]).optional(),
  marriageDate: z.union([dateSchema, z.literal('')]).optional(),
  marriageCity: z.string().optional().default(''),
  marriageCountry: z.string().optional().default(''),
  divorceDate: z.union([dateSchema, z.literal('')]).optional(),
  divorceCity: z.string().optional(),
  divorceCountry: z.string().optional(),
});

// Petitioner parent: "Current City and Country of Residence" when living (city + country, NOT full address)
// Conditional fields are .optional() at base; enforced via superRefine only when isLiving === true
const petitionerParentBase = z.object({
  surnames: z.string().min(1, 'Surnames are required'),
  givenNames: z.string().min(1, 'Given names are required'),
  dateOfBirth: dateSchema,
  cityOfBirth: z.string().min(1, 'City of birth is required'),
  countryOfBirth: z.string().min(1, 'Country of birth is required'),
  isLiving: z.union([z.boolean(), z.null()]),
  currentCity: z.string().optional(),
  currentCountry: z.string().optional(),
}).superRefine((d, ctx) => {
  if (d.isLiving !== true && d.isLiving !== false) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Yes or No for Is living?', path: ['isLiving'] });
  }
  if (d.isLiving === true) {
    if (!d.currentCity?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Current city of residence is required when living', path: ['currentCity'] });
    }
    if (!d.currentCountry?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Country of residence is required when living', path: ['currentCountry'] });
    }
  }
});

// Beneficiary parent: "Full Current Address" when living; "Year of Death" when not
// Conditional fields are .optional() at base; enforced via superRefine only when toggle is active
const beneficiaryParentSuperRefine = (d: { isLiving: boolean | null; fullCurrentAddress?: string; yearOfDeath?: string }, ctx: z.RefinementCtx) => {
  if (d.isLiving !== true && d.isLiving !== false) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Yes or No for Is living?', path: ['isLiving'] });
  }
  if (d.isLiving === true && !d.fullCurrentAddress?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Full current address is required when living', path: ['fullCurrentAddress'] });
  }
  if (d.isLiving === false && !d.yearOfDeath?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Year of death is required when not living', path: ['yearOfDeath'] });
  }
};

const beneficiaryFatherSchema = z.object({
  surnames: z.string().min(1, 'Surnames are required'),
  givenNames: z.string().min(1, 'Given names are required'),
  dateOfBirth: dateSchema,
  cityOfBirth: z.string().min(1, 'City of birth is required'),
  countryOfBirth: z.string().min(1, 'Country of birth is required'),
  isLiving: z.union([z.boolean(), z.null()]),
  fullCurrentAddress: z.string().optional(),
  yearOfDeath: z.string().optional(),
}).superRefine(beneficiaryParentSuperRefine);

const beneficiaryMotherSchema = z.object({
  surnames: z.string().min(1, 'Surnames are required'),
  surnamesAtBirth: z.string().optional(),
  givenNames: z.string().min(1, 'Given names are required'),
  dateOfBirth: dateSchema,
  cityOfBirth: z.string().min(1, 'City of birth is required'),
  countryOfBirth: z.string().min(1, 'Country of birth is required'),
  isLiving: z.union([z.boolean(), z.null()]),
  fullCurrentAddress: z.string().optional(),
  yearOfDeath: z.string().optional(),
}).superRefine(beneficiaryParentSuperRefine);

// Child schema (Step 3): Child Names and Surname, DOB, City of Birth, State/Country of Birth, livesWithYou, immigratingWithYou
// livesWithYou/immigratingWithYou allow null so radios render unselected by default (Meir: "leave unmarked so the client can choose")
// isUSCitizen added per Meir's feedback — gates "US passport for child" in the Step 8 document list.
export const childSchema = z.object({
  nameSurname: z.string().min(1, 'Child names and surname are required'),
  dateOfBirth: dateSchema,
  cityOfBirth: z.string().min(1, 'City of birth is required'),
  stateOrCountryOfBirth: z.string().min(1, 'State/Country of birth is required'),
  livesWithYou: z.union([z.boolean(), z.null()]),
  immigratingWithYou: z.union([z.boolean(), z.null()]),
  isUSCitizen: z.union([z.boolean(), z.null()]).optional(),
}).superRefine((d, ctx) => {
  if (d.livesWithYou !== true && d.livesWithYou !== false) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Yes or No', path: ['livesWithYou'] });
  }
  if (d.immigratingWithYou !== true && d.immigratingWithYou !== false) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Yes or No', path: ['immigratingWithYou'] });
  }
  if (d.isUSCitizen !== true && d.isUSCitizen !== false) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Yes or No', path: ['isUSCitizen'] });
  }
});

// Marital status: conditional validation via superRefine
// - timesMarried === 0 → nothing validated (both sections hidden)
// - timesMarried === 1 → only currentMarriage validated (prior marriages hidden)
// - timesMarried > 1  → currentMarriage + priorMarriages validated
const maritalStatusSchema = z.object({
  timesMarried: z.number().min(0, 'Must be 0 or more').max(20),
  currentMarriage: z.object({
    // Phase 2.6: when the beneficiary's spouse IS the petitioner, we auto-fill
    // from petitioner data — no need to re-enter.
    spouseIsPetitioner: z.boolean().optional(),
    date: z.union([dateSchema, z.literal('')]).optional(),
    city: z.string().optional().default(''),
    country: z.string().optional().default(''),
    spouseName: z.string().optional().default(''),
    spouseDateOfBirth: z.union([dateSchema, z.literal('')]).optional(),
    // Extra spouse fields for when spouse is NOT the petitioner (Meir's feedback)
    spouseOccupation: z.string().optional(),
    spouseIntendToImmigrate: z.boolean().optional(),
  }),
  priorMarriages: z.array(priorMarriageSchema),
}).superRefine((data, ctx) => {
  const tm = data.timesMarried ?? 0;

  // ── timesMarried >= 1 → currentMarriage fields required ──
  if (tm >= 1) {
    const cm = data.currentMarriage;
    if (!cm.date || cm.date === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Date of marriage is required', path: ['currentMarriage', 'date'] });
    }
    if (!cm.city?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Marriage city is required', path: ['currentMarriage', 'city'] });
    }
    if (!cm.country?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Marriage country is required', path: ['currentMarriage', 'country'] });
    }
    if (!cm.spouseName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Spouse name is required', path: ['currentMarriage', 'spouseName'] });
    }
  }

  // ── timesMarried > 1 → prior marriages required and validated ──
  if (tm > 1) {
    const prior = data.priorMarriages ?? [];
    if (prior.length < tm - 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Please add details for all ${tm - 1} prior marriage(s)`, path: ['priorMarriages'] });
    }
    prior.forEach((pm, i) => {
      if (!pm.fullName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Full name is required', path: ['priorMarriages', i, 'fullName'] });
      }
      if (!pm.dateOfBirth || pm.dateOfBirth === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Date of birth is required', path: ['priorMarriages', i, 'dateOfBirth'] });
      }
      if (!pm.marriageDate || pm.marriageDate === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Marriage date is required', path: ['priorMarriages', i, 'marriageDate'] });
      }
      if (!pm.marriageCity?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Marriage city is required', path: ['priorMarriages', i, 'marriageCity'] });
      }
      if (!pm.marriageCountry?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Marriage country is required', path: ['priorMarriages', i, 'marriageCountry'] });
      }
      // Per Meir's feedback: divorce fields are required (red asterisk)
      if (!pm.divorceDate || pm.divorceDate === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Divorce date is required', path: ['priorMarriages', i, 'divorceDate'] });
      }
      if (!pm.divorceCity?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Divorce city is required', path: ['priorMarriages', i, 'divorceCity'] });
      }
      if (!pm.divorceCountry?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Divorce country is required', path: ['priorMarriages', i, 'divorceCountry'] });
      }
    });
  }
});

// Re-export for external use
export const parentSchema = petitionerParentBase;

// Step 3: Marital Status only
export const step3MaritalStatusSchema = z.object({
  petitioner: z.object({ maritalStatus: maritalStatusSchema }),
  beneficiary: z.object({ maritalStatus: maritalStatusSchema }),
});

// Step 4: Family (Parents & Children)
export const step4FamilySchema = z.object({
  petitioner: z.object({
    father: petitionerParentBase,
    mother: petitionerParentBase,
    numberOfDependentChildren: z.number().min(0).max(50),
  }),
  beneficiary: z.object({
    father: beneficiaryFatherSchema,
    mother: beneficiaryMotherSchema,
    childrenSameAsPetitioner: z.boolean().optional(),
    numberOfAllChildren: z.number().min(0).max(50),
    children: z.array(childSchema),
  }).refine(
    (data) =>
      data.childrenSameAsPetitioner === true || data.children.length >= data.numberOfAllChildren,
    { message: 'Please add details for all children', path: ['children'] }
  ),
});

// Employment entry schema (Step 5 - Employment History)
export const employmentEntrySchema = z.object({
  position: z.string().min(1, 'Position/Job title is required'),
  employerName: z.string().min(1, 'Employer name is required'),
  employerAddress: z.string().min(1, 'Employer address is required'),
  fromDate: dateSchema,
  toDate: z.union([dateSchema, z.literal('')]).optional(), // empty = present
});

// Education institution schema (Step 5 - Beneficiary)
// Fields are .optional() at base level; required-ness is enforced via superRefine
// only when attendedUniversityOrHighSchool is true
export const educationInstitutionSchema = z.object({
  name: z.string().optional().default(''),
  address: z.string().optional().default(''),
  major: z.string().optional(),
  degree: z.string().optional(),
  fromDate: z.union([dateSchema, z.literal('')]).optional(),
  toDate: z.union([dateSchema, z.literal('')]).optional(),
});

// Step 5: Employment History
export const step5EmploymentHistorySchema = z.object({
  petitioner: z.object({
    currentEmploymentStatus: z.enum(['employed', 'student', 'unemployed', 'retired']).optional(),
    employments: z.array(employmentEntrySchema),
    petitionerSalary: z.union([z.string(), z.number()]).optional(),
  }),
  beneficiary: z.object({
    currentEmploymentStatus: z.enum(['employed', 'student', 'unemployed', 'retired']).optional(),
    employments: z.array(employmentEntrySchema),
    intendedJobFieldInUS: z.string().optional(),
    attendedUniversityOrHighSchool: z.union([z.boolean(), z.null()]),
    numberOfInstitutions: z.number().min(0).max(50).optional(),
    institutions: z.array(educationInstitutionSchema),
    beneficiarySalary: z.union([z.string(), z.number()]).optional(),
  }).superRefine((d, ctx) => {
    // Require an explicit Yes/No answer (Meir: "leave unmarked so the client can choose")
    if (d.attendedUniversityOrHighSchool !== true && d.attendedUniversityOrHighSchool !== false) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select Yes or No', path: ['attendedUniversityOrHighSchool'] });
    }
    // Only validate institutions when the education toggle is active
    if (d.attendedUniversityOrHighSchool === true) {
      if (!d.institutions || d.institutions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least one institution when you attended university or high school',
          path: ['institutions'],
        });
      }
      d.institutions?.forEach((inst, i) => {
        if (!inst.name?.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Name of institution is required', path: ['institutions', i, 'name'] });
        }
        if (!inst.address?.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Full address is required', path: ['institutions', i, 'address'] });
        }
        if (!inst.fromDate || inst.fromDate === '') {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start date is required', path: ['institutions', i, 'fromDate'] });
        }
      });
    }
  }),
});

// Legacy employment schema (kept for compatibility)
export const employmentSchema = z.object({
  position: z.string().min(1),
  employerName: z.string().min(1),
  employerAddress: z.string().min(1),
  fromDate: dateSchema,
  toDate: dateSchema,
});

// Education schema (Step 4)
export const educationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  major: z.string().optional(),
  degree: z.string().optional(),
  fromDate: dateSchema,
  toDate: dateSchema,
});

// Nationality/Passport entry (Step 6)
export const nationalityPassportSchema = z.object({
  nationality: z.string().min(1, 'Nationality is required'),
  passportNumber: z.string().optional(),
});

// Step 6: Other Information & Background
export const step6OtherInfoSchema = z
  .object({
    petitioner: z.object({
      nationalities: z.array(nationalityPassportSchema),
      eyeColor: z.string().optional(),
      hairColor: z.string().optional(),
      heightFeet: z.union([z.string(), z.number()]).optional(),
      weightPounds: z.union([z.string(), z.number()]).optional(),
      appliedForGreenCardBefore: z.string().optional(),
      howBecameUSCitizen: z.string().optional(),
    }),
  beneficiary: z.object({
    nationalities: z.array(nationalityPassportSchema),
    eyeColor: z.string().optional(),
    hairColor: z.string().optional(),
    heightFeet: z.union([z.string(), z.number()]).optional(),
    weightPounds: z.union([z.string(), z.number()]).optional(),
    appliedForGreenCardBefore: z.string().optional(),
    militaryBranch: z.string().optional(),
    militaryDates: z.string().optional(),
    militaryRank: z.string().optional(),
    militaryPosition: z.string().optional(),
    militaryCountry: z.string().optional(),
    traveledToCountriesLast5Years: z.string().optional(),
    usVisaDateIssued: z.string().optional(),
    usVisaClassification: z.string().optional(),
    usVisaNumber: z.string().optional(),
    usVisaLostStolenExplain: z.string().optional(),
    usVisaCanceledRevokedExplain: z.string().optional(),
    last5USVisits: z.array(
      z.object({
        dateArrived: z.union([z.string(), z.literal('')]).optional(),
        lengthOfStay: z.string().optional(),
      })
    ).optional(),
    belongedToOrganizations: z.boolean().optional(),
    organizationsExplain: z.string().optional(),
    specializedSkills: z.boolean().optional(),
    skillsExplain: z.string().optional(),
    paramilitaryInvolvement: z.boolean().optional(),
    paramilitaryExplain: z.string().optional(),
    speakOtherLanguages: z.boolean().optional(),
    languagesSpoken: z.string().optional(),
    organizationsSkills: z.string().optional(), // legacy — kept for backward compat
    wantSSAIssueSSN: z.boolean().optional(),
    authorizeDisclosureDHS: z.boolean().optional(),
    socialMediaFacebook: z.string().optional(),
    socialMediaInstagram: z.string().optional(),
    socialMediaLinkedIn: z.string().optional(),
    socialMediaTwitter: z.string().optional(),
  }),
})
  .refine(
    (data) => (data.petitioner.nationalities?.length ?? 0) >= 1,
    { message: 'At least one nationality is required for petitioner', path: ['petitioner', 'nationalities'] }
  )
  .refine(
    (data) => (data.beneficiary.nationalities?.length ?? 0) >= 1,
    { message: 'At least one nationality is required for beneficiary', path: ['beneficiary', 'nationalities'] }
  );

// Step 7: Security and Background Information
const securityAnswerSchema = z.object({
  answer: z.union([z.boolean(), z.null()]),
  explanation: z.string().optional(),
});

export const step7SecurityBackgroundSchema = z.object({
  securityAnswers: z.array(securityAnswerSchema),
}).superRefine((data, ctx) => {
  const answers = data.securityAnswers ?? [];
  // Every question must be answered Yes or No
  const allAnswered = answers.every((a) => a.answer === true || a.answer === false);
  if (!allAnswered) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please answer every question',
      path: ['securityAnswers'],
    });
  }
  // Vaccination (index 1): explanation required ONLY when answer is "No"
  const vaccination = answers[1];
  if (vaccination && vaccination.answer === false) {
    if (!vaccination.explanation?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Explanation is required when answering No to the vaccination question',
        path: ['securityAnswers', 1, 'explanation'],
      });
    }
  }
});

// Full form schema (aggregates all steps)
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3MaritalStatusData = z.infer<typeof step3MaritalStatusSchema>;
export type Step4FamilyData = z.infer<typeof step4FamilySchema>;
export type Step5EmploymentHistoryData = z.infer<typeof step5EmploymentHistorySchema>;
export type Step6OtherInfoData = z.infer<typeof step6OtherInfoSchema>;
export type Step7SecurityBackgroundData = z.infer<typeof step7SecurityBackgroundSchema>;
export type EmploymentEntry = z.infer<typeof employmentEntrySchema>;
export type Step3Data = Step3MaritalStatusData & Step4FamilyData;
export type BasicPerson = z.infer<typeof basicPersonSchema>;
export type Address = z.infer<typeof addressSchema>;
export type PreviousAddress = z.infer<typeof previousAddressSchema>;
export type FutureUSAddress = z.infer<typeof futureUSAddressSchema>;
export type Marriage = z.infer<typeof marriageSchema>;
export type PriorMarriage = z.infer<typeof priorMarriageSchema>;
export type Parent = z.infer<typeof parentSchema>;
export type Child = z.infer<typeof childSchema>;
export type AdditionalPhone = z.infer<typeof additionalPhoneSchema>;
