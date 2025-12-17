"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, MessageCircle } from "lucide-react";

export default function RegistrationSuccessPage() {

  // Prevent back navigation
  useEffect(() => {
    // Replace current history entry
    window.history.pushState(null, "", window.location.href);
    
    // Listen for back button
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      alert("Your registration has been submitted. You cannot go back to the form.");
    };
    
    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-green-200 dark:border-green-800 shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Registration Submitted Successfully!
            </h1>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Thank you for completing your DV Lottery registration with DRSI Law.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-start gap-3 text-left">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    What Happens Next?
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[24px]">1.</span>
                      <span>
                        You will receive a <strong>confirmation email</strong> with your registration PDF 
                        and registration ID within 24 hours.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[24px]">2.</span>
                      <span>
                        Our team will <strong>review your documents</strong> to ensure everything is complete 
                        and meets the requirements.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[24px]">3.</span>
                      <span>
                        If additional information is needed, we will <strong>contact you via email</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[24px]">4.</span>
                      <span>
                        Once approved, your application will be <strong>submitted to the US government</strong> 
                        for the Diversity Visa Lottery.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Important:</strong> Please check your email (including spam folder) for the confirmation. 
                If you don't receive it within 24 hours, contact us at{" "}
                <a href="mailto:office@drsi-law.com" className="text-[#B02828] hover:underline font-semibold">
                  office@drsi-law.com
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = "mailto:office@drsi-law.com"}
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 hover:text-green-800"
                onClick={() => window.open("https://wa.me/972587644252", "_blank")}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              Need help? Contact us via{" "}
              <a 
                href="https://wa.me/972587644252" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#B02828] hover:underline font-semibold"
              >
                WhatsApp: +972 58-764-4252
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

