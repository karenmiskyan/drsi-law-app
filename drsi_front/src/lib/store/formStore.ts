import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BasicPerson, Address, PreviousAddress, FutureUSAddress, Step3Data, Step5EmploymentHistoryData, Step6OtherInfoData, Step7SecurityBackgroundData } from '../schemas';
import { SECURITY_QUESTIONS } from '../securityQuestions';

// Step 8 document upload tracking
export interface Step8DocumentUpload {
  fileName: string;
  fileSize: number;
  path?: string;
  needsTranslation?: boolean;
  documentStatus?: 'pending' | 'approved' | 'rejected';
  adminComment?: string | null;
}

export interface Step8DocumentsData {
  uploads: Record<string, Step8DocumentUpload>;
}

// Initial empty address
const emptyAddress: Address = {
  street: '',
  floorAptSuite: '',
  city: '',
  zip: '',
  stateOrCountry: '',
  startDate: '',
  endDate: '',
};

// Initial future US address
const emptyFutureUSAddress: FutureUSAddress = {
  nameOfPersonLiving: '',
  address: '',
  floorAptSuite: '',
  city: '',
  state: '',
  zipCode: '',
  phoneCountryCode: '+1',
  phoneNumber: '',
  isGreenCardDeliveryAddress: true,
  contactPerson: '',
  contactStreet: '',
  contactFloorAptSuite: '',
  contactCity: '',
  contactState: '',
  contactZip: '',
  contactPhoneCountryCode: '+1',
  contactPhone: '',
};

// Step 3 empty values
const emptyMaritalStatus = {
  timesMarried: 0,
  currentMarriage: { date: '', city: '', country: '', spouseName: '', spouseDateOfBirth: '' },
  priorMarriages: [] as Array<{
    fullName: string;
    dateOfBirth: string;
    marriageDate: string;
    marriageCity: string;
    marriageCountry: string;
    divorceDate?: string;
    divorceCity?: string;
    divorceCountry?: string;
  }>,
};
const emptyPetitionerParent = {
  surnames: '',
  givenNames: '',
  dateOfBirth: '',
  cityOfBirth: '',
  countryOfBirth: '',
  isLiving: null as boolean | null,
  currentCity: '',
  currentCountry: '',
};
const emptyBeneficiaryFather = {
  surnames: '',
  givenNames: '',
  dateOfBirth: '',
  cityOfBirth: '',
  countryOfBirth: '',
  isLiving: null as boolean | null,
  fullCurrentAddress: '',
  yearOfDeath: '',
};
const emptyBeneficiaryMother = { ...emptyBeneficiaryFather, surnamesAtBirth: '' as string | undefined };

// Initial empty person for form
const emptyPerson: BasicPerson = {
  firstName: '',
  middleName: '',
  surname: '',
  fullName: '',
  relationship: '',
  phoneCountryCode: '+1',
  phoneNumber: '',
  email: '',
  dateOfBirth: '',
  cityOfBirth: '',
  countryOfBirth: '',
  socialSecurityNumber: '',
  aNumber: '',
  additionalPhones: [],
  additionalEmails: [],
};

export interface FormState {
  // Step 1: Basic Information
  petitioner: BasicPerson;
  beneficiary: BasicPerson;

  // Step 2: Address History
  petitionerAddress: {
    currentAddress: Address;
    previousAddresses: PreviousAddress[];
    livedInOtherCountryOver6Months?: boolean;
    livedInOtherCountryDetails?: Array<{ country: string; duration: string }>;
  };
  beneficiaryAddress: {
    currentAddress: Address;
    previousAddresses: PreviousAddress[];
    livedInOtherCountryOver6Months?: boolean;
    livedInOtherCountryDetails?: Array<{ country: string; duration: string }>;
  };
  futureUSAddress: FutureUSAddress;

  // Step 3: Marital Status & Family
  step3Data: Step3Data;

  // Step 5: Employment History
  step5Data: Step5EmploymentHistoryData;

  // Step 6: Other Information
  step6Data: Step6OtherInfoData;

  // Step 7: Security and Background Information
  step7Data: Step7SecurityBackgroundData;

  // Step 8: Document Uploads
  step8Documents: Step8DocumentsData;

  // Case Type (Step 0 — Intro)
  // Per Meir's feedback: "Unmarried Child" split into Minor (<21) and Adult (21+).
  // Legacy 'child' is accepted by the type so old localStorage/DB records migrate cleanly —
  // hydration normalises legacy 'child' → 'child_minor' in App.tsx.
  caseType: 'spouse' | 'child' | 'child_minor' | 'child_adult' | 'parent' | null;
  petitionerCitizenshipStatus: 'citizen' | 'greencard_holder' | null;

  currentStep: number;
  totalSteps: number;
  /** Highest step the user has reached. Used by the clickable Stepper to allow jumping back. */
  maxVisitedStep: number;

  // Actions
  setCaseType: (type: 'spouse' | 'child' | 'child_minor' | 'child_adult' | 'parent' | null) => void;
  setPetitionerCitizenshipStatus: (status: 'citizen' | 'greencard_holder' | null) => void;
  setPetitioner: (data: Partial<BasicPerson>) => void;
  setBeneficiary: (data: Partial<BasicPerson>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPetitionerAddress: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setBeneficiaryAddress: (data: any) => void;
  setFutureUSAddress: (data: Partial<FutureUSAddress>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setStep3Data: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setStep5Data: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setStep6Data: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setStep7Data: (data: any) => void;
  setStep8Documents: (data: Partial<Step8DocumentsData>) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
}

const initialState = {
  petitioner: { ...emptyPerson },
  beneficiary: { ...emptyPerson },
  petitionerAddress: {
    currentAddress: { ...emptyAddress },
    previousAddresses: [],
    livedInOtherCountryOver6Months: undefined,
    livedInOtherCountryDetails: [],
  },
  beneficiaryAddress: {
    currentAddress: { ...emptyAddress },
    previousAddresses: [],
    livedInOtherCountryOver6Months: undefined,
    livedInOtherCountryDetails: [],
  },
  futureUSAddress: { ...emptyFutureUSAddress },
  step3Data: {
    petitioner: {
      maritalStatus: { ...emptyMaritalStatus },
      father: { ...emptyPetitionerParent },
      mother: { ...emptyPetitionerParent },
      numberOfDependentChildren: 0,
    },
    beneficiary: {
      maritalStatus: { ...emptyMaritalStatus },
      father: { ...emptyBeneficiaryFather },
      mother: { ...emptyBeneficiaryMother },
      childrenSameAsPetitioner: false,
      numberOfAllChildren: 0,
      children: [],
    },
  } as Step3Data,
  step7Data: {
    securityAnswers: SECURITY_QUESTIONS.map(() => ({ answer: null as boolean | null, explanation: '' })),
  },
  step5Data: {
    petitioner: {
      employments: [],
      currentEmploymentStatus: undefined as 'employed' | 'student' | 'unemployed' | 'retired' | undefined,
      petitionerSalary: '',
    },
    beneficiary: {
      employments: [],
      currentEmploymentStatus: undefined as 'employed' | 'student' | 'unemployed' | 'retired' | undefined,
      intendedJobFieldInUS: '',
      attendedUniversityOrHighSchool: null as unknown as boolean,
      numberOfInstitutions: 0,
      institutions: [],
      beneficiarySalary: '',
    },
  },
  step6Data: {
    petitioner: {
      nationalities: [],
      eyeColor: '',
      hairColor: '',
      heightFeet: '',
      weightPounds: '',
      appliedForGreenCardBefore: '',
      howBecameUSCitizen: '',
    },
    beneficiary: {
      nationalities: [],
      eyeColor: '',
      hairColor: '',
      heightFeet: '',
      weightPounds: '',
      appliedForGreenCardBefore: '',
      militaryBranch: '',
      militaryDates: '',
      militaryRank: '',
      militaryPosition: '',
      militaryCountry: '',
      traveledToCountriesLast5Years: '',
      usVisaDateIssued: '',
      usVisaClassification: '',
      usVisaNumber: '',
      usVisaLostStolenExplain: '',
      usVisaCanceledRevokedExplain: '',
      last5USVisits: [],
      belongedToOrganizations: undefined,
      specializedSkills: undefined,
      paramilitaryInvolvement: undefined,
      speakOtherLanguages: undefined,
      languagesSpoken: '',
      organizationsSkills: '',
      wantSSAIssueSSN: false,
      authorizeDisclosureDHS: false,
      socialMediaFacebook: '',
      socialMediaInstagram: '',
      socialMediaLinkedIn: '',
      socialMediaTwitter: '',
    },
  },
  step8Documents: {
    uploads: {},
  },
  caseType: null,
  petitionerCitizenshipStatus: null,
  currentStep: 0,
  totalSteps: 8,
  maxVisitedStep: 0,
};

/** Storage key includes user email so each user has their own form data (no leak on soft refresh). */
export function getFormStorageKey(): string {
  try {
    const saved = localStorage.getItem('auth_user');
    const user = saved ? JSON.parse(saved) : null;
    const email = user?.email ?? 'anonymous';
    return `green-card-form-storage-${String(email).replace(/[^a-zA-Z0-9@._-]/g, '_')}`;
  } catch {
    return 'green-card-form-storage-anonymous';
  }
}

// Storage adapter used by Zustand persist (referenced inline below)

/** Call before clearAuth so we still know the current user's key. */
export function clearFormStorageForCurrentUser(): void {
  localStorage.removeItem(getFormStorageKey());
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      ...initialState,

      setPetitioner: (data) =>
        set((state) => ({
          petitioner: { ...state.petitioner, ...data },
        })),

      setBeneficiary: (data) =>
        set((state) => ({
          beneficiary: { ...state.beneficiary, ...data },
        })),

      setPetitionerAddress: (data) =>
        set((state) => ({
          petitionerAddress: {
            ...state.petitionerAddress,
            currentAddress: data.currentAddress
              ? { ...state.petitionerAddress.currentAddress, ...data.currentAddress } as Address
              : state.petitionerAddress.currentAddress,
            previousAddresses:
              (data.previousAddresses ?? state.petitionerAddress.previousAddresses) as PreviousAddress[],
            livedInOtherCountryOver6Months: data.livedInOtherCountryOver6Months ?? state.petitionerAddress.livedInOtherCountryOver6Months,
            livedInOtherCountryDetails: data.livedInOtherCountryDetails ?? state.petitionerAddress.livedInOtherCountryDetails,
          },
        })),

      setBeneficiaryAddress: (data) =>
        set((state) => ({
          beneficiaryAddress: {
            ...state.beneficiaryAddress,
            currentAddress: data.currentAddress
              ? { ...state.beneficiaryAddress.currentAddress, ...data.currentAddress } as Address
              : state.beneficiaryAddress.currentAddress,
            previousAddresses:
              (data.previousAddresses ?? state.beneficiaryAddress.previousAddresses) as PreviousAddress[],
            livedInOtherCountryOver6Months: data.livedInOtherCountryOver6Months ?? state.beneficiaryAddress.livedInOtherCountryOver6Months,
            livedInOtherCountryDetails: data.livedInOtherCountryDetails ?? state.beneficiaryAddress.livedInOtherCountryDetails,
          },
        })),

      setFutureUSAddress: (data) =>
        set((state) => ({
          futureUSAddress: { ...state.futureUSAddress, ...data },
        })),

      setStep3Data: (data) =>
        set((state) => ({
          step3Data: {
            petitioner: data.petitioner
              ? { ...state.step3Data.petitioner, ...data.petitioner }
              : state.step3Data.petitioner,
            beneficiary: data.beneficiary
              ? { ...state.step3Data.beneficiary, ...data.beneficiary }
              : state.step3Data.beneficiary,
          },
        })),

      setStep5Data: (data) =>
        set((state) => ({
          step5Data: {
            petitioner: data.petitioner
              ? { ...state.step5Data.petitioner, ...data.petitioner }
              : state.step5Data.petitioner,
            beneficiary: data.beneficiary
              ? { ...state.step5Data.beneficiary, ...data.beneficiary }
              : state.step5Data.beneficiary,
          },
        })),

      setStep6Data: (data) =>
        set((state) => ({
          step6Data: {
            petitioner: data.petitioner
              ? { ...state.step6Data.petitioner, ...data.petitioner }
              : state.step6Data.petitioner,
            beneficiary: data.beneficiary
              ? { ...state.step6Data.beneficiary, ...data.beneficiary }
              : state.step6Data.beneficiary,
          },
        })),

      setStep7Data: (data) =>
        set((state) => ({
          step7Data: {
            securityAnswers: data.securityAnswers ?? state.step7Data.securityAnswers,
          },
        })),

      setStep8Documents: (data) =>
        set((state) => ({
          step8Documents: {
            uploads: { ...state.step8Documents.uploads, ...data.uploads },
          },
        })),

      setCaseType: (type) => set({ caseType: type }),

      setPetitionerCitizenshipStatus: (status) => set({ petitionerCitizenshipStatus: status }),

      setCurrentStep: (step) => set((state) => ({
        currentStep: step,
        maxVisitedStep: Math.max(state.maxVisitedStep ?? 0, step),
      })),

      resetForm: () => set({ ...initialState }),
    }),
    {
      name: 'green-card-form-storage',
      skipHydration: true,
      storage: createJSONStorage(() => ({
        getItem: () => localStorage.getItem(getFormStorageKey()),
        setItem: (_, value) => localStorage.setItem(getFormStorageKey(), value),
        removeItem: () => localStorage.removeItem(getFormStorageKey()),
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialize: (state): any => ({
        petitioner: state.petitioner,
        beneficiary: state.beneficiary,
        petitionerAddress: state.petitionerAddress,
        beneficiaryAddress: state.beneficiaryAddress,
        futureUSAddress: state.futureUSAddress,
        step3Data: state.step3Data,
        step5Data: state.step5Data,
        step6Data: state.step6Data,
        step7Data: state.step7Data,
        step8Documents: state.step8Documents,
        caseType: state.caseType,
        petitionerCitizenshipStatus: state.petitionerCitizenshipStatus,
        currentStep: state.currentStep,
        maxVisitedStep: state.maxVisitedStep,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<FormState>),
        // Preserve caseType from persisted state (null fallback for old localStorage)
        caseType: (persistedState as Partial<FormState>)?.caseType ?? currentState.caseType,
        petitionerCitizenshipStatus: (persistedState as Partial<FormState>)?.petitionerCitizenshipStatus ?? currentState.petitionerCitizenshipStatus,
        // Ensure step3Data always has full structure (handles old localStorage without step3Data)
        step3Data: {
          ...currentState.step3Data,
          ...(persistedState as Partial<FormState>)?.step3Data,
        } as Step3Data,
        step5Data: {
          petitioner: {
            ...currentState.step5Data.petitioner,
            ...(persistedState as Partial<FormState>)?.step5Data?.petitioner,
          },
          beneficiary: {
            ...currentState.step5Data.beneficiary,
            ...(persistedState as Partial<FormState>)?.step5Data?.beneficiary,
          },
        } as Step5EmploymentHistoryData,
        step6Data: {
          petitioner: {
            ...currentState.step6Data.petitioner,
            ...(persistedState as Partial<FormState>)?.step6Data?.petitioner,
          },
          beneficiary: {
            ...currentState.step6Data.beneficiary,
            ...(persistedState as Partial<FormState>)?.step6Data?.beneficiary,
          },
        } as Step6OtherInfoData,
        step7Data: {
          ...currentState.step7Data,
          ...(persistedState as Partial<FormState>)?.step7Data,
        } as Step7SecurityBackgroundData,
        step8Documents: {
          uploads: {
            ...currentState.step8Documents.uploads,
            ...(persistedState as Partial<FormState>)?.step8Documents?.uploads,
          },
        },
      }),
    }
  )
);
