import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface ApplicantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  gender: "male" | "female" | "";
  cityOfBirth: string;
  countryOfBirth: string;
  mailingAddress: string;
  educationLevel:
    | "primary"
    | "high_school_no_degree"
    | "high_school_degree"
    | "university"
    | "masters"
    | "doctorate"
    | "";
  currentResidence: {
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
  };
}

export interface SpouseInfo {
  fullName: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  gender: "male" | "female" | "";
  cityOfBirth: string;
  countryOfBirth: string;
  educationLevel: string;
  isUSCitizenOrLPR: boolean;
}

export interface ChildInfo {
  id: string;
  fullName: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  gender: "male" | "female" | "";
  birthPlace: string;
  isUSCitizenOrLPR: boolean;
}

export interface DocumentUpload {
  applicant: {
    photo: File | null;
    passport: File | null;
    educationDoc: File | null;
  };
  spouse: {
    photo: File | null;
    passport: File | null;
    educationDoc: File | null;
    marriageCert: File | null;
  } | null;
  children: {
    [childId: string]: {
      photo: File | null;
      passport: File | null;
      birthCert: File | null;
    };
  };
}

interface RegistrationFormState {
  // Access control
  isAuthenticated: boolean;
  token: string | null;
  isReadOnly: boolean;
  
  // Current step
  currentStep: number;
  
  // Form data
  applicantInfo: ApplicantInfo | null;
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "separated" | "";
  spouseInfo: SpouseInfo | null;
  numberOfChildren: number;
  children: ChildInfo[];
  documents: DocumentUpload;
  
  // Actions
  setToken: (token: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setReadOnly: (readOnly: boolean) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Data setters
  setApplicantInfo: (info: ApplicantInfo) => void;
  setMaritalStatus: (status: RegistrationFormState["maritalStatus"]) => void;
  setSpouseInfo: (info: SpouseInfo | null) => void;
  setNumberOfChildren: (count: number) => void;
  addChild: () => void;
  updateChild: (id: string, data: Partial<ChildInfo>) => void;
  removeChild: (id: string) => void;
  setDocuments: (docs: Partial<DocumentUpload>) => void;
  
  // Reset
  resetForm: () => void;
}

const initialApplicantInfo: ApplicantInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: { day: "", month: "", year: "" },
  gender: "",
  cityOfBirth: "",
  countryOfBirth: "",
  mailingAddress: "",
  educationLevel: "",
  currentResidence: {
    streetAddress: "",
    streetAddress2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
  },
};

const initialDocuments: DocumentUpload = {
  applicant: {
    photo: null,
    passport: null,
    educationDoc: null,
  },
  spouse: null,
  children: {},
};

export const useRegistrationFormStore = create<RegistrationFormState>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      token: null,
      isReadOnly: false,
      currentStep: 1,
      applicantInfo: initialApplicantInfo,
      maritalStatus: "",
      spouseInfo: null,
      numberOfChildren: 0,
      children: [],
      documents: initialDocuments,

      // Actions
      setToken: (token) => set({ token }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
      
      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
      previousStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

      setApplicantInfo: (info) => set({ applicantInfo: info }),
      setMaritalStatus: (status) => set({ maritalStatus: status }),
      setSpouseInfo: (info) => set({ spouseInfo: info }),
      
      setNumberOfChildren: (count) => set({ numberOfChildren: count }),
      
      addChild: () =>
        set((state) => ({
          children: [
            ...state.children,
            {
              id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              fullName: "",
              dateOfBirth: { day: "", month: "", year: "" },
              gender: "",
              birthPlace: "",
              isUSCitizenOrLPR: false,
            },
          ],
        })),
      
      updateChild: (id, data) =>
        set((state) => ({
          children: state.children.map((child) =>
            child.id === id ? { ...child, ...data } : child
          ),
        })),
      
      removeChild: (id) =>
        set((state) => ({
          children: state.children.filter((child) => child.id !== id),
        })),
      
      setDocuments: (docs) =>
        set((state) => ({
          documents: {
            ...state.documents,
            ...docs,
          },
        })),

      resetForm: () =>
        set({
          isAuthenticated: false,
          token: null,
          isReadOnly: false,
          currentStep: 1,
          applicantInfo: initialApplicantInfo,
          maritalStatus: "",
          spouseInfo: null,
          numberOfChildren: 0,
          children: [],
          documents: initialDocuments,
        }),
    }),
    {
      name: "drsi-registration-form",
      partialize: (state) => ({
        // Don't persist files (they can't be serialized)
        currentStep: state.currentStep,
        applicantInfo: state.applicantInfo,
        maritalStatus: state.maritalStatus,
        spouseInfo: state.spouseInfo,
        numberOfChildren: state.numberOfChildren,
        children: state.children,
      }),
    }
  )
);


