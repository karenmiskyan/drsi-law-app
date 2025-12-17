"use client";

import { Check } from "lucide-react";
import { useRegistrationLanguage } from "@/contexts/RegistrationLanguageContext";

interface RegistrationProgressProps {
  currentStep: number;
}

export function RegistrationProgress({ currentStep }: RegistrationProgressProps) {
  const { t } = useRegistrationLanguage();
  
  const steps = [
    { number: 1, title: t.steps.applicantInfo },
    { number: 2, title: t.steps.maritalStatus },
    { number: 3, title: t.steps.children },
    { number: 4, title: t.steps.documents },
    { number: 5, title: t.steps.review },
  ];
  return (
    <div className="w-full py-4">
      <div className="max-w-4xl mx-auto px-4">
        {/* Mobile: Current Step Only */}
        <div className="sm:hidden text-center mb-3">
          <p className="text-xs text-white/70 drop-shadow">
            {t.progress.step} {currentStep} {t.progress.of} {steps.length}
          </p>
          <p className="text-base font-semibold text-white drop-shadow-lg">
            {steps[currentStep - 1].title}
          </p>
        </div>

        {/* Desktop: Full Progress Bar */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/20 -z-10" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-[#B02828] -z-10 transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />

            {steps.map((step) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;

              return (
                <div key={step.number} className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      font-semibold text-xs transition-all duration-300 shadow-lg
                      ${
                        isCompleted
                          ? "bg-[#B02828] text-white"
                          : isCurrent
                          ? "bg-[#B02828] text-white ring-4 ring-[#B02828]/30"
                          : "bg-white/90 border-2 border-white/40 text-gray-600"
                      }
                    `}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                  </div>

                  {/* Label */}
                  <p
                    className={`
                      mt-1.5 text-xs font-medium text-center drop-shadow
                      ${isCurrent || isCompleted ? "text-white font-semibold" : "text-white/60"}
                    `}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


