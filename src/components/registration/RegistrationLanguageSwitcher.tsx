"use client";

import { useRegistrationLanguage } from "@/contexts/RegistrationLanguageContext";
import { Button } from "../ui/button";
import { Globe } from "lucide-react";

export function RegistrationLanguageSwitcher() {
  const { language, setLanguage } = useRegistrationLanguage();

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1">
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className={`rounded-full h-9 px-4 ${
          language === "en"
            ? "bg-white text-gray-900 hover:bg-white/90"
            : "text-white hover:bg-white/20"
        }`}
      >
        <Globe className="h-4 w-4 mr-1" />
        English
      </Button>
      <Button
        variant={language === "he" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("he")}
        className={`rounded-full h-9 px-4 ${
          language === "he"
            ? "bg-white text-gray-900 hover:bg-white/90"
            : "text-white hover:bg-white/20"
        }`}
      >
        <Globe className="h-4 w-4 mr-1" />
        עברית
      </Button>
    </div>
  );
}

