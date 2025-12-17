"use client";

import { useState } from "react";
import { useRegistrationStore } from "@/stores/registrationStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  calculateServiceFee,
  calculateTotalPrice,
  GOVERNMENT_FEE,
} from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";

export function Step4Payment() {
  const {
    maritalStatus,
    contactInfo,
    signature,
    previousStep,
    setPaymentIntentId,
  } = useRegistrationStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!maritalStatus || !contactInfo || !signature) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-destructive">
            Missing required information. Please go back and complete all steps.
          </p>
        </CardContent>
      </Card>
    );
  }

  const serviceFee = calculateServiceFee(maritalStatus);
  const totalPrice = calculateTotalPrice(maritalStatus);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    console.log("🔍 Preparing checkout with signature:", {
      hasSignature: !!signature,
      signatureLength: signature?.length || 0,
      signaturePreview: signature?.substring(0, 50) + "...",
    });

    try {
      // Create Stripe Checkout Session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maritalStatus,
          contactInfo,
          signature,
          amount: totalPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.details || errorData.error || "Failed to create checkout session";
        console.error("Checkout API error:", errorData);
        throw new Error(errorMsg);
      }

      const { sessionId, url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during checkout"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Summary & Payment</CardTitle>
        <CardDescription>
          Review your information and complete payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Information Summary */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold mb-3">Contact Information</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              {contactInfo.firstName} {contactInfo.lastName}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {contactInfo.email}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {contactInfo.phone}
            </p>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="border rounded-lg p-6 bg-background space-y-4">
          <h3 className="font-semibold text-lg">Payment Breakdown</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium">Service Fee</p>
                <p className="text-xs text-muted-foreground">
                  Professional consultation & application preparation
                </p>
              </div>
              <span className="font-semibold text-lg">
                {formatCurrency(serviceFee)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium">Government Fee</p>
                <p className="text-xs text-muted-foreground">
                  Statutory filing fee
                </p>
              </div>
              <span className="font-semibold">
                {formatCurrency(GOVERNMENT_FEE)}
              </span>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-bold text-xl">Total Amount</span>
              <span className="font-bold text-3xl text-primary">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Confirmation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>Contract signed and ready for processing</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Payment Note */}
        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Secure Payment:</strong> You will be redirected to Stripe's
            secure checkout page to complete your payment. All transactions are
            encrypted and secure.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={previousStep}
            disabled={isProcessing}
          >
            Back
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handlePayment}
            disabled={isProcessing}
            className="min-w-[200px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {formatCurrency(totalPrice)}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

