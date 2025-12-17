"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactInfoSchema, ContactInfoFormData } from "@/lib/validation";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export function Step1ContactInfo() {
  const { contactInfo, setContactInfo, nextStep } = useRegistrationStore();
  const { t, isRTL } = useLanguage();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: contactInfo || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = (data: ContactInfoFormData) => {
    setContactInfo(data);
    nextStep();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#B02828] to-[#8B1F1F] text-white p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">{t.step1.title}</CardTitle>
        <CardDescription className="text-gray-200 text-sm sm:text-base">
          {t.step1.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t.step1.firstName} <span className="text-destructive">{t.step1.required}</span>
              </Label>
              <Input
                id="firstName"
                placeholder={t.step1.firstName}
                {...register("firstName")}
                aria-invalid={errors.firstName ? "true" : "false"}
                className="h-11"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t.step1.lastName} <span className="text-destructive">{t.step1.required}</span>
              </Label>
              <Input
                id="lastName"
                placeholder={t.step1.lastName}
                {...register("lastName")}
                aria-invalid={errors.lastName ? "true" : "false"}
                className="h-11"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t.step1.email} <span className="text-destructive">{t.step1.required}</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              className="h-11"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              {t.step1.phone} <span className="text-destructive">{t.step1.required}</span>
            </Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  {...field}
                  country="il"
                  preferredCountries={["il", "us"]}
                  enableSearch
                  searchPlaceholder="Search country..."
                  containerClass="phone-input-container"
                  inputClass="phone-input-field"
                  buttonClass="phone-input-button"
                  dropdownClass="phone-input-dropdown"
                  inputProps={{
                    id: "phone",
                    required: true,
                    autoFocus: false,
                  }}
                  inputStyle={{
                    width: "100%",
                    height: "44px",
                    fontSize: "14px",
                    paddingLeft: "48px",
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--input))",
                  }}
                  buttonStyle={{
                    borderRadius: "0.5rem 0 0 0.5rem",
                    border: "1px solid hsl(var(--input))",
                    borderRight: "none",
                  }}
                  dropdownStyle={{
                    borderRadius: "0.5rem",
                  }}
                />
              )}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting}
              className="bg-[#B02828] hover:bg-[#8B1F1F] text-white px-6 sm:px-8 w-full sm:w-auto"
            >
              {t.step1.continue}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
