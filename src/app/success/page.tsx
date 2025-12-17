"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, FileText, Loader2, ArrowRight, ClipboardCheck } from "lucide-react";
import { generateTestToken } from "@/lib/tokenVerification";

interface PaymentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "separated";
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch payment session data from Stripe
        const response = await fetch(`/api/get-session?session_id=${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Extract user data from session metadata
          const userData: PaymentData = {
            firstName: data.metadata?.firstName || "",
            lastName: data.metadata?.lastName || "",
            email: data.customer_email || data.metadata?.email || "",
            phone: data.metadata?.phone || "",
            maritalStatus: data.metadata?.maritalStatus || "single",
          };
          
          setPaymentData(userData);
          
          // Generate registration token
          if (userData.email && userData.firstName) {
            const token = generateTestToken({
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              phone: userData.phone,
              maritalStatus: userData.maritalStatus,
            });
            
            setRegistrationToken(token);
          }
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Thank you for choosing DRSI Law for your immigration lottery
                registration.
              </p>
            </div>

            {/* Registration CTA - Primary Action */}
            {registrationToken && (
              <div className="bg-[#B02828] text-white rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">Next Step: Complete Your Registration</h3>
                    <p className="text-white/90 text-sm">
                      Your payment info is saved. Continue with your full application now.
                    </p>
                  </div>
                </div>
                
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-white text-[#B02828] hover:bg-gray-100 font-semibold text-lg h-14"
                >
                  <Link href={`/register?token=${registrationToken}`}>
                    Complete Registration Form
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <p className="text-xs text-white/80 text-center">
                  ✓ Your contact info will be pre-filled • Takes ~10 minutes
                </p>
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                What Happens Next?
              </h3>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[24px]">1.</span>
                  <span>
                    <strong>Complete the registration form above</strong> with your detailed information 
                    and upload required documents.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[24px]">2.</span>
                  <span>
                    You will receive a confirmation email with your signed contract and 
                    payment receipt within a few minutes.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[24px]">3.</span>
                  <span>
                    Check your email inbox (and spam folder) for the registration link 
                    and important information.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[24px]">4.</span>
                  <span>
                    Our team will review your complete application and submit it to the 
                    US government on your behalf.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">
                    Your Documents Are Safe
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your signed contract has been securely stored and a copy has
                    been sent to your email address.
                  </p>
                </div>
              </div>
            </div>

            {sessionId && (
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Transaction ID:{" "}
                  <code className="bg-muted px-2 py-1 rounded">
                    {sessionId.substring(0, 20)}...
                  </code>
                </p>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button asChild variant="outline" size="lg">
                <a href="mailto:office@drsi-law.com">Contact Support</a>
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need help? Call us at{" "}
                <a
                  href="https://wa.me/972587644252"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  WhatsApp: +972 58-764-4252
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}

