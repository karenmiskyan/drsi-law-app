"use client";

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SignatureCanvas from "react-signature-canvas";
import { contractSigningSchema, ContractSigningFormData } from "@/lib/validation";
import { useRegistrationStore } from "@/stores/registrationStore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateTotalPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { Eraser, Loader2, CheckCircle2 } from "lucide-react";

const SERVICE_AGREEMENT = `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into by and between DRSI Law ("Service Provider") and the client ("Client").

1. SERVICES
The Service Provider agrees to provide immigration lottery registration services to the Client, including the preparation and submission of all necessary documentation for the Diversity Visa (DV) Lottery program.

2. FEES AND PAYMENT
The Client agrees to pay the Service Provider the total amount of [TOTAL_PRICE] for the services described herein. This fee includes:
   - Service Fee: Professional consultation and application preparation
   - Government Fee: $1.00 (statutory filing fee)

3. PAYMENT TERMS
Payment is due in full before the submission of the application. All fees are non-refundable once the application has been submitted to the appropriate government agency.

4. CLIENT RESPONSIBILITIES
The Client agrees to:
   - Provide accurate and complete information
   - Submit all required documentation in a timely manner
   - Respond promptly to any requests for additional information

5. NO GUARANTEE
The Service Provider makes no guarantee regarding the outcome of the lottery registration. Selection is determined solely by the U.S. government through a random lottery process.

6. CONFIDENTIALITY
The Service Provider agrees to maintain the confidentiality of all Client information and will not disclose such information to third parties without the Client's consent, except as required by law.

7. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the United States.

By signing below, the Client acknowledges that they have read, understood, and agree to be bound by the terms and conditions of this Agreement.
`;

export function Step3ContractSigning() {
  const {
    maritalStatus,
    contactInfo,
    setSignature,
    setAgreedToTerms,
    nextStep,
    previousStep,
  } = useRegistrationStore();

  const signatureRef = useRef<SignatureCanvas>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const totalPrice = maritalStatus
    ? calculateTotalPrice(maritalStatus)
    : 0;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContractSigningFormData>({
    resolver: zodResolver(contractSigningSchema),
    defaultValues: {
      agreedToTerms: false,
      signature: "",
    },
  });

  const clearSignature = () => {
    signatureRef.current?.clear();
    setIsSignatureEmpty(true);
    setValue("signature", "");
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      setValue("signature", signatureData);
      setIsSignatureEmpty(signatureRef.current.isEmpty());
    }
  };

  const onSubmit = async (data: ContractSigningFormData) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Save contract to Google Drive and send email
      const response = await fetch("/api/save-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactInfo,
          maritalStatus,
          signature: data.signature,
          amount: totalPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to save contract");
      }

      const result = await response.json();
      console.log("✅ Contract saved:", result);

      // Show success message briefly
      setSaveSuccess(true);
      
      // Update store
      setSignature(data.signature);
      setAgreedToTerms(data.agreedToTerms);

      // Wait a moment to show success, then proceed
      setTimeout(() => {
        nextStep();
      }, 1500);
    } catch (error) {
      console.error("Error saving contract:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save contract");
      setIsSaving(false);
    }
  };

  // Replace [TOTAL_PRICE] with actual price in the agreement
  const personalizedAgreement = SERVICE_AGREEMENT.replace(
    "[TOTAL_PRICE]",
    formatCurrency(totalPrice)
  );

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Service Agreement</CardTitle>
        <CardDescription>
          Please review the agreement and provide your signature
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Agreement Text */}
          <div className="border rounded-lg p-6 bg-muted/30 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-sans">
              {personalizedAgreement}
            </pre>
          </div>

          {/* Client Info Display */}
          {contactInfo && (
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Client Information:</h4>
              <p className="text-sm text-muted-foreground">
                {contactInfo.firstName} {contactInfo.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {contactInfo.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {contactInfo.phone}
              </p>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="space-y-2">
            <Controller
              name="agreedToTerms"
              control={control}
              render={({ field }) => (
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreedToTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label
                    htmlFor="agreedToTerms"
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    I have read and agree to the terms and conditions of this
                    Service Agreement <span className="text-destructive">*</span>
                  </Label>
                </div>
              )}
            />
            {errors.agreedToTerms && (
              <p className="text-sm text-destructive">
                {errors.agreedToTerms.message}
              </p>
            )}
          </div>

          {/* Signature Canvas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>
                Your Signature <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="h-8"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
            <div className="border-2 border-dashed rounded-lg bg-background">
              <SignatureCanvas
                ref={signatureRef}
                onEnd={handleSignatureEnd}
                canvasProps={{
                  className: "w-full h-40 rounded-lg",
                }}
                backgroundColor="white"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Please sign above using your mouse or touchscreen
            </p>
            {errors.signature && (
              <p className="text-sm text-destructive">
                {errors.signature.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <p className="text-sm text-destructive">{saveError}</p>
            </div>
          )}

          {/* Success Message */}
          {saveSuccess && (
            <div className="p-4 border border-green-500/50 rounded-lg bg-green-50 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-700 font-medium">
                Contract saved successfully! Redirecting to payment...
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={previousStep}
              disabled={isSaving}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSignatureEmpty || isSaving}
              className="min-w-[200px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Contract...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

