"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicantInfoSchema, ApplicantInfoFormData, educationLevels, countries } from "@/lib/registrationValidation";
import { useRegistrationFormStore } from "@/stores/registrationFormStore";
import { useRegistrationLanguage } from "@/contexts/RegistrationLanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Step1ApplicantInfo() {
  const { applicantInfo, isReadOnly, setApplicantInfo, nextStep } = useRegistrationFormStore();
  const { t } = useRegistrationLanguage();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApplicantInfoFormData>({
    resolver: zodResolver(applicantInfoSchema),
    defaultValues: applicantInfo || undefined,
  });

  // 🔧 FIX: Update form when store changes (e.g., browser back, token pre-fill)
  useEffect(() => {
    if (applicantInfo) {
      console.log("📝 Step 1: Syncing form with store", applicantInfo);
      reset(applicantInfo);
    }
  }, [applicantInfo, reset]);

  const educationLevel = watch("educationLevel");
  const showWorkExperienceAlert =
    educationLevel === "primary" || educationLevel === "high_school_no_degree";

  const onSubmit = (data: ApplicantInfoFormData) => {
    console.log("✅ Step 1: Saving data to store", data);
    setApplicantInfo(data);
    nextStep();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-[#B02828] to-[#8B1F1F] text-white">
        <CardTitle className="text-2xl">{t.step1.title}</CardTitle>
        <CardDescription className="text-gray-100">
          {t.step1.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h3>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  disabled={isReadOnly}
                  className={isReadOnly ? "bg-gray-100" : ""}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  disabled={isReadOnly}
                  className={isReadOnly ? "bg-gray-100" : ""}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  disabled={isReadOnly}
                  className={isReadOnly ? "bg-gray-100" : ""}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  disabled={isReadOnly}
                  className={isReadOnly ? "bg-gray-100" : ""}
                  placeholder="+1234567890"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label>
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    {...register("dateOfBirth.day")}
                    placeholder="Day"
                    type="number"
                    min="1"
                    max="31"
                  />
                  {errors.dateOfBirth?.day && (
                    <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.day.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    {...register("dateOfBirth.month")}
                    placeholder="Month"
                    type="number"
                    min="1"
                    max="12"
                  />
                  {errors.dateOfBirth?.month && (
                    <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.month.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    {...register("dateOfBirth.year")}
                    placeholder="Year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  {errors.dateOfBirth?.year && (
                    <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.year.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>
                Gender <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Birth Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Birth Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cityOfBirth">
                  City of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cityOfBirth"
                  {...register("cityOfBirth")}
                  placeholder="Enter city"
                />
                {errors.cityOfBirth && (
                  <p className="text-sm text-red-500">{errors.cityOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Country of Birth <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="countryOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.countryOfBirth && (
                  <p className="text-sm text-red-500">{errors.countryOfBirth.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Current Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Current Address
            </h3>

            <div className="space-y-2">
              <Label htmlFor="mailingAddress">
                Mailing Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mailingAddress"
                {...register("mailingAddress")}
                placeholder="Street address, City, State/Province, ZIP/Postal Code"
              />
              {errors.mailingAddress && (
                <p className="text-sm text-red-500">{errors.mailingAddress.message}</p>
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Education
            </h3>

            <div className="space-y-2">
              <Label>
                Highest Level of Education <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="educationLevel"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.educationLevel && (
                <p className="text-sm text-red-500">{errors.educationLevel.message}</p>
              )}
            </div>

            {/* Work Experience Alert */}
            {showWorkExperienceAlert && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> To be eligible for the DV Lottery with this education
                  level, you must have at least 2 years of work experience in a qualifying
                  occupation within the past 5 years.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Current Residence Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Current Residence
            </h3>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="streetAddress"
                {...register("currentResidence.streetAddress")}
                placeholder="Enter street address"
              />
              {errors.currentResidence?.streetAddress && (
                <p className="text-sm text-red-500">{errors.currentResidence.streetAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress2">
                Street Address Line 2
              </Label>
              <Input
                id="streetAddress2"
                {...register("currentResidence.streetAddress2")}
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  {...register("currentResidence.city")}
                  placeholder="City"
                />
                {errors.currentResidence?.city && (
                  <p className="text-sm text-red-500">{errors.currentResidence.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateProvince">
                  State / Province <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stateProvince"
                  {...register("currentResidence.stateProvince")}
                  placeholder="State/Province"
                />
                {errors.currentResidence?.stateProvince && (
                  <p className="text-sm text-red-500">{errors.currentResidence.stateProvince.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">
                  Postal / Zip Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  {...register("currentResidence.postalCode")}
                  placeholder="Postal Code"
                />
                {errors.currentResidence?.postalCode && (
                  <p className="text-sm text-red-500">{errors.currentResidence.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              className="bg-[#B02828] hover:bg-[#8B1F1F] text-white px-8"
            >
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


