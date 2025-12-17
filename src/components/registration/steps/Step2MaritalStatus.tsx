"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  spouseInfoSchema,
  SpouseInfoFormData,
  educationLevels,
  countries,
} from "@/lib/registrationValidation";
import { useRegistrationFormStore } from "@/stores/registrationFormStore";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

export function Step2MaritalStatus() {
  const {
    maritalStatus,
    spouseInfo,
    isReadOnly,
    setMaritalStatus,
    setSpouseInfo,
    nextStep,
    previousStep,
  } = useRegistrationFormStore();

  const [selectedStatus, setSelectedStatus] = useState(maritalStatus || "");
  const showSpouseSection = selectedStatus === "married";

  // Update selectedStatus when maritalStatus changes from store (e.g., token pre-fill)
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SpouseInfoFormData>({
    resolver: showSpouseSection ? zodResolver(spouseInfoSchema) : undefined,
    defaultValues: spouseInfo || {
      fullName: "",
      dateOfBirth: { day: "", month: "", year: "" },
      gender: "",
      cityOfBirth: "",
      countryOfBirth: "",
      educationLevel: "",
      isUSCitizenOrLPR: false,
    },
  });

  // 🔧 FIX: Sync marital status from store
  useEffect(() => {
    if (maritalStatus && maritalStatus !== selectedStatus) {
      setSelectedStatus(maritalStatus);
      console.log("📝 Step 2: Pre-filled marital status from token:", maritalStatus);
    }
  }, [maritalStatus, selectedStatus]);

  // 🔧 FIX: Sync spouse form data from store
  useEffect(() => {
    if (showSpouseSection && spouseInfo) {
      console.log("📝 Step 2: Syncing spouse form with store", spouseInfo);
      reset(spouseInfo);
    }
  }, [spouseInfo, showSpouseSection, reset]);

  const onSubmit = (data?: SpouseInfoFormData) => {
    console.log("✅ Step 2: Saving marital status:", selectedStatus);
    setMaritalStatus(selectedStatus as any);

    if (showSpouseSection && data) {
      console.log("✅ Step 2: Saving spouse info:", data);
      setSpouseInfo(data);
    } else {
      setSpouseInfo(null);
    }

    nextStep();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-[#B02828] to-[#8B1F1F] text-white">
        <CardTitle className="text-2xl">Marital Status</CardTitle>
        <CardDescription className="text-gray-100">
          Please provide your marital status and spouse details (if applicable)
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Marital Status Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Marital Status
            </h3>

            <div className="space-y-2">
              <Label>
                Current Marital Status <span className="text-red-500">*</span>
              </Label>
              <Select
                onValueChange={setSelectedStatus}
                value={selectedStatus}
                disabled={isReadOnly}
              >
                <SelectTrigger className={isReadOnly ? "bg-gray-100" : ""}>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="separated">Legally Separated</SelectItem>
                </SelectContent>
              </Select>
              {!selectedStatus && (
                <p className="text-sm text-red-500">Please select marital status</p>
              )}
            </div>
          </div>

          {/* Spouse Section (Conditional) */}
          {showSpouseSection && (
            <div className="space-y-6 border-t pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-[#B02828]" />
                <h3 className="text-lg font-semibold text-gray-900">Spouse Information</h3>
              </div>

              {/* Spouse Full Name */}
              <div className="space-y-2">
                <Label htmlFor="spouseFullName">
                  Spouse Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="spouseFullName"
                  {...register("fullName")}
                  placeholder="Enter spouse's full legal name"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              {/* Spouse Date of Birth */}
              <div className="space-y-2">
                <Label>
                  Spouse Date of Birth <span className="text-red-500">*</span>
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
                      <p className="text-xs text-red-500 mt-1">
                        {errors.dateOfBirth.day.message}
                      </p>
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
                      <p className="text-xs text-red-500 mt-1">
                        {errors.dateOfBirth.month.message}
                      </p>
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
                      <p className="text-xs text-red-500 mt-1">
                        {errors.dateOfBirth.year.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Spouse Gender */}
              <div className="space-y-2">
                <Label>
                  Spouse Gender <span className="text-red-500">*</span>
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

              {/* Spouse Birth Place */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spouseCityOfBirth">
                    Spouse City of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="spouseCityOfBirth"
                    {...register("cityOfBirth")}
                    placeholder="Enter city"
                  />
                  {errors.cityOfBirth && (
                    <p className="text-sm text-red-500">{errors.cityOfBirth.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Spouse Country of Birth <span className="text-red-500">*</span>
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

              {/* Spouse Education */}
              <div className="space-y-2">
                <Label>
                  Spouse Education Level <span className="text-red-500">*</span>
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

              {/* US Citizen/Green Card Holder Question */}
              <div className="space-y-4 mt-6 pt-6 border-t">
                <Label className="text-base font-semibold">
                  Is your spouse a U.S. Citizen or Green Card Holder? <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="isUSCitizenOrLPR"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      <div
                        onClick={() => field.onChange(true)}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          field.value === true
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            field.value === true
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {field.value === true && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium">Yes</span>
                      </div>

                      <div
                        onClick={() => field.onChange(false)}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          field.value === false
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            field.value === false
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {field.value === false && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium">No</span>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              onClick={previousStep}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            <Button
              type="submit"
              size="lg"
              className="bg-[#B02828] hover:bg-[#8B1F1F] text-white px-8"
              disabled={!selectedStatus}
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


