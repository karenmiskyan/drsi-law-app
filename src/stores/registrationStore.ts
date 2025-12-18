import { create } from "zustand";
import { MaritalStatus } from "@/lib/pricing";

// Re-export MaritalStatus for use in other files
export type { MaritalStatus };

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface RegistrationState {
  // Current step (1-4)
  currentStep: number;
  
  // Form data
  contactInfo: ContactInfo | null;
  maritalStatus: MaritalStatus | null;
  signature: string | null;
  agreedToTerms: boolean;
  
  // Stripe payment intent ID (for tracking)
  paymentIntentId: string | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setContactInfo: (info: ContactInfo) => void;
  setMaritalStatus: (status: MaritalStatus) => void;
  setSignature: (signature: string) => void;
  setAgreedToTerms: (agreed: boolean) => void;
  setPaymentIntentId: (id: string) => void;
  resetWizard: () => void;
}

const initialState = {
  currentStep: 1,
  contactInfo: null,
  maritalStatus: null,
  signature: null,
  agreedToTerms: false,
  paymentIntentId: null,
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4),
    })),
  
  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),
  
  setContactInfo: (info) => set({ contactInfo: info }),
  
  setMaritalStatus: (status) => set({ maritalStatus: status }),
  
  setSignature: (signature) => set({ signature }),
  
  setAgreedToTerms: (agreed) => set({ agreedToTerms: agreed }),
  
  setPaymentIntentId: (id) => set({ paymentIntentId: id }),
  
  resetWizard: () => set(initialState),
}));

