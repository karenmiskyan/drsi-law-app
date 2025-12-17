"use client";

import React from "react";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Step1ContactInfo } from "./steps/Step1ContactInfo";
import { Step2MaritalStatus } from "./steps/Step2MaritalStatus";
import { Step3ContractSigning } from "./steps/Step3ContractSigning";
import { Step4Payment } from "./steps/Step4Payment";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";

export function RegistrationWizard() {
  const { currentStep } = useRegistrationStore();
  const { t, isRTL } = useLanguage();

  const steps = [
    { number: 1, title: t.steps.contactInfo },
    { number: 2, title: t.steps.pricing },
    { number: 3, title: t.steps.contract },
    { number: 4, title: t.steps.payment },
  ];

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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with Logo & Language Switcher - Centered */}
        <div className="pt-4 mb-6 text-center">
          {/* Logo */}
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
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200 drop-shadow">
            {t.subtitle}
          </p>
          
          {/* Language Switcher - Centered */}
          <div className="flex justify-center mt-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Progress Stepper - Fixed & Mobile Optimized */}
        <div className="mb-6 mt-6">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-between relative">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center z-10 relative">
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 shadow-lg",
                        currentStep > step.number
                          ? "bg-green-500 text-white shadow-green-500/50"
                          : currentStep === step.number
                          ? "bg-[#B02828] text-white ring-4 ring-[#B02828]/30 shadow-[#B02828]/50 scale-110"
                          : "bg-white/20 backdrop-blur-sm text-white/60 border-2 border-white/30"
                      )}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold mt-1.5 sm:mt-2 text-center transition-all duration-300 whitespace-nowrap",
                        currentStep >= step.number
                          ? "text-white drop-shadow-md"
                          : "text-white/50"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 relative -mx-2 sm:mx-0">
                      {/* Background line */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 rounded-full" />
                      {/* Progress line */}
                      <div
                        className={cn(
                          "absolute top-0 left-0 h-0.5 rounded-full transition-all duration-500",
                          currentStep > step.number
                            ? "bg-green-500 shadow-lg shadow-green-500/50"
                            : "bg-transparent"
                        )}
                        style={{
                          width: currentStep > step.number ? "100%" : "0%",
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="transition-all duration-300">
          {currentStep === 1 && <Step1ContactInfo />}
          {currentStep === 2 && <Step2MaritalStatus />}
          {currentStep === 3 && <Step3ContractSigning />}
          {currentStep === 4 && <Step4Payment />}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-white/70">
          <p className="drop-shadow">{t.footer.copyright}</p>
          <p className="mt-1 drop-shadow">
            {t.footer.support}{" "}
            <a
              href="mailto:office@drsi-law.com"
              className="text-white hover:text-[#B02828] transition-colors underline"
            >
              office@drsi-law.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

