"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maritalStatusSchema, MaritalStatusFormData } from "@/lib/validation";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateServiceFee,
  calculateTotalPrice,
  isDoubleChanseBundle,
  GOVERNMENT_FEE,
} from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { Heart } from "lucide-react";

export function Step2MaritalStatus() {
  const { maritalStatus, setMaritalStatus, nextStep, previousStep } =
    useRegistrationStore();
  const { t } = useLanguage();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MaritalStatusFormData>({
    resolver: zodResolver(maritalStatusSchema),
    defaultValues: {
      maritalStatus: maritalStatus || undefined,
    },
  });

  const selectedStatus = watch("maritalStatus");

  const onSubmit = (data: MaritalStatusFormData) => {
    setMaritalStatus(data.maritalStatus);
    nextStep();
  };

  const serviceFee = selectedStatus
    ? calculateServiceFee(selectedStatus)
    : null;
  const totalPrice = selectedStatus
    ? calculateTotalPrice(selectedStatus)
    : null;
  const showDoubleChanceBadge =
    selectedStatus && isDoubleChanseBundle(selectedStatus);

  const maritalStatusOptions = [
    { value: "single", label: t.step2.statuses.single },
    { value: "married", label: t.step2.statuses.married },
    { value: "married_to_citizen", label: t.step2.statuses.marriedToCitizen },
    { value: "divorced", label: t.step2.statuses.divorced },
    { value: "widowed", label: t.step2.statuses.widowed },
    { value: "legally_separated", label: t.step2.statuses.legallySeparated },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-[#B02828] to-[#8B1F1F] text-white p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">{t.step2.title}</CardTitle>
        <CardDescription className="text-gray-200 text-sm sm:text-base">
          {t.step2.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">
              {t.step2.maritalStatus} <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="maritalStatus" className="h-11">
                    <SelectValue placeholder={t.step2.selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.maritalStatus && (
              <p className="text-sm text-destructive">
                {errors.maritalStatus.message}
              </p>
            )}
          </div>

          {/* Dynamic Pricing Display */}
          {selectedStatus && (
            <div className="mt-6 p-6 border-2 border-[#B02828]/20 rounded-xl bg-gradient-to-br from-[#B02828]/5 to-transparent space-y-4">
              <h3 className="font-bold text-lg text-[#B02828]">{t.step2.pricingBreakdown}</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">{t.step2.serviceFee}</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(serviceFee!)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-600">{t.step2.govFee}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(GOVERNMENT_FEE)}
                  </span>
                </div>

                <div className="border-t-2 border-[#B02828]/20 pt-4 flex justify-between items-center">
                  <span className="font-bold text-xl text-gray-900">{t.step2.total}</span>
                  <span className="font-bold text-3xl text-[#B02828]">
                    {formatCurrency(totalPrice!)}
                  </span>
                </div>
              </div>

              {/* Double Chance Bundle Badge */}
              {showDoubleChanceBadge && (
                <div className="mt-4 p-4 bg-[#B02828] text-white rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-6 w-6 fill-white" />
                    <Badge variant="secondary" className="text-xs bg-white text-[#B02828]">
                      {t.step2.doubleChance}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/90 mt-2">
                    {t.step2.doubleChanceDesc}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={previousStep}
              className="border-2 hover:bg-gray-50 w-full sm:w-auto"
            >
              {t.step2.back}
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              disabled={!selectedStatus}
              className="bg-[#B02828] hover:bg-[#8B1F1F] text-white px-6 sm:px-8 w-full sm:w-auto"
            >
              {t.step2.continue}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

