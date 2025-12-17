"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  registrationTranslations,
  RegistrationLanguage,
  RegistrationTranslationKey,
} from "@/lib/i18n/registrationTranslations";

interface RegistrationLanguageContextType {
  language: RegistrationLanguage;
  setLanguage: (lang: RegistrationLanguage) => void;
  t: RegistrationTranslationKey;
  isRTL: boolean;
}

const RegistrationLanguageContext = createContext<
  RegistrationLanguageContextType | undefined
>(undefined);

export function RegistrationLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<RegistrationLanguage>("en");
  const [isRTL, setIsRTL] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("registration-language") as RegistrationLanguage;
    if (savedLang && registrationTranslations[savedLang]) {
      setLanguageState(savedLang);
      setIsRTL(savedLang === "he");
    }
  }, []);

  const setLanguage = (lang: RegistrationLanguage) => {
    setLanguageState(lang);
    setIsRTL(lang === "he");
    localStorage.setItem("registration-language", lang);
    
    // Update document direction
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  };

  const value = {
    language,
    setLanguage,
    t: registrationTranslations[language],
    isRTL,
  };

  return (
    <RegistrationLanguageContext.Provider value={value}>
      {children}
    </RegistrationLanguageContext.Provider>
  );
}

export function useRegistrationLanguage() {
  const context = useContext(RegistrationLanguageContext);
  if (context === undefined) {
    throw new Error(
      "useRegistrationLanguage must be used within a RegistrationLanguageProvider"
    );
  }
  return context;
}

