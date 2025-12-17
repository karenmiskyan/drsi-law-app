"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRegistrationFormStore } from "@/stores/registrationFormStore";
import { verifyToken } from "@/lib/tokenVerification";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { RegistrationLanguageProvider } from "@/contexts/RegistrationLanguageContext";
import { Loader2 } from "lucide-react";

function RegistrationPageContent() {
  const searchParams = useSearchParams();
  const {
    currentStep,
    setToken,
    setAuthenticated,
    setReadOnly,
    setApplicantInfo,
    setMaritalStatus,
    setCurrentStep,
    resetForm,
  } = useRegistrationFormStore();

  const [isVerifying, setIsVerifying] = useState(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // 🔧 FIX: Only initialize once to prevent overriding user-entered data
    if (hasInitializedRef.current) {
      console.log("⏭️ Skipping re-initialization (already initialized)");
      setIsVerifying(false);
      return;
    }

    const initializeForm = async () => {
      const token = searchParams.get("token");

      if (token) {
        // 🔧 FIX: Token users get FRESH START - clear old localStorage data
        console.log("🔐 Token detected - Starting fresh session");
        
        // Clear localStorage AND sessionStorage to prevent old data from interfering
        if (typeof window !== "undefined") {
          const oldData = localStorage.getItem("drsi-registration-form");
          if (oldData) {
            console.log("🧹 Clearing old localStorage data for token user");
            localStorage.removeItem("drsi-registration-form");
          }
          
          // Clear any old submission tokens from sessionStorage
          const sessionKeys = Object.keys(sessionStorage);
          const tokenKeys = sessionKeys.filter(key => key.startsWith("submission_token_"));
          if (tokenKeys.length > 0) {
            console.log("🧹 Clearing old submission tokens from sessionStorage");
            tokenKeys.forEach(key => sessionStorage.removeItem(key));
          }
        }
        
        // Reset form completely
        resetForm();
        console.log("🔄 Form reset for token user");
        
        // Verify token
        const userData = await verifyToken(token);

        if (userData) {
          console.log("✅ Token verified successfully:", {
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            phone: userData.phone,
          });
          
          // 🔧 FIX: ALWAYS pre-fill from token (don't check if empty)
          console.log("📝 Pre-filling contact info from token");
          setApplicantInfo({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
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
          });

          // Set marital status from payment record
          const registrationMaritalStatus = 
            userData.maritalStatus === "married_to_citizen" || userData.maritalStatus === "married_to_lpr"
              ? "married"
              : userData.maritalStatus === "legally_separated"
              ? "separated"
              : userData.maritalStatus;
          
          setMaritalStatus(registrationMaritalStatus);
          console.log(`📝 Marital status set: ${registrationMaritalStatus}`);

          // Lock contact info fields
          setToken(token);
          setAuthenticated(true);
          setReadOnly(true);
          
          // 🔧 FIX: Force step 1 for token users
          setCurrentStep(1);
          console.log("✅ Token user initialized - Starting at Step 1");
        } else {
          console.error("❌ Token verification failed");
          // Continue as public user
          setAuthenticated(false);
          setReadOnly(false);
          setCurrentStep(1);
        }
      } else {
        // Public user flow (manual entry)
        console.log("🌐 No token - Public access mode");
        setAuthenticated(false);
        setReadOnly(false);
        
        // 🔧 FIX: Reset to step 1 if user comes back without token
        if (currentStep !== 1) {
          console.log(`🔄 Resetting from step ${currentStep} to step 1 (no token)`);
          setCurrentStep(1);
        }
        
        console.log("✅ Public user initialized");
      }

      hasInitializedRef.current = true;
      setIsVerifying(false);
    };

    initializeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#B02828] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading registration form...</p>
        </div>
      </div>
    );
  }

  return (
    <RegistrationLanguageProvider>
      <RegistrationWizard />
    </RegistrationLanguageProvider>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <Loader2 className="h-12 w-12 text-[#B02828] animate-spin" />
        </div>
      }
    >
      <RegistrationPageContent />
    </Suspense>
  );
}


