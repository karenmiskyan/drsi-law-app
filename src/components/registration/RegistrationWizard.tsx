"use client";

import { useRegistrationFormStore } from "@/stores/registrationFormStore";
import { useRegistrationLanguage } from "@/contexts/RegistrationLanguageContext";
import { RegistrationProgress } from "./RegistrationProgress";
import { Step1ApplicantInfo } from "./steps/Step1ApplicantInfo";
import { Step2MaritalStatus } from "./steps/Step2MaritalStatus";
import { Step3ChildrenDetails } from "./steps/Step3ChildrenDetails";
import { Step4DocumentUpload } from "./steps/Step4DocumentUpload";
import { Step5Review } from "./steps/Step5Review";
import { RegistrationLanguageSwitcher } from "./RegistrationLanguageSwitcher";
import Image from "next/image";

export function RegistrationWizard() {
  const { currentStep, isAuthenticated, isReadOnly } = useRegistrationFormStore();
  const { t, isRTL } = useRegistrationLanguage();

  return (
    <div 
      className="min-h-screen relative overflow-hidden py-4 px-4"
      style={{
        background: "linear-gradient(135deg, rgba(20,36,27,0.95) 0%, rgba(40,20,20,0.95) 100%)",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 text-center relative z-10">
        <div className="flex justify-center mb-3">
          <Image
            src="/images/drsi-logo.png"
            alt="DRSI Law Logo"
            width={100}
            height={100}
            priority
            className="object-contain"
          />
        </div>
        <p className="text-white/80 drop-shadow">
          {t.subtitle}
        </p>
        
        {/* Language Switcher - Centered */}
        <div className="flex justify-center mt-4">
          <RegistrationLanguageSwitcher />
        </div>
        
        {isAuthenticated && (
          <div className="mt-4 inline-block">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              {t.authenticatedBadge}
            </span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="relative z-10">
        <RegistrationProgress currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {currentStep === 1 && <Step1ApplicantInfo />}
        {currentStep === 2 && <Step2MaritalStatus />}
        {currentStep === 3 && <Step3ChildrenDetails />}
        {currentStep === 4 && <Step4DocumentUpload />}
        {currentStep === 5 && <Step5Review />}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-8 text-center text-sm text-white/70 relative z-10">
        <p className="drop-shadow">
          <strong>{t.footer.company}</strong> - {t.footer.tagline}
        </p>
        <p className="mt-1 drop-shadow">
          {t.footer.needHelp} office@drsi-law.com {t.footer.or} +972 58-764-4252
        </p>
        <p className="mt-2 drop-shadow">
          {t.footer.copyright}
        </p>
      </div>
    </div>
  );
}


