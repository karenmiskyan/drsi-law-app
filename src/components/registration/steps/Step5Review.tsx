"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationFormStore } from "@/stores/registrationFormStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, CheckCircle, Loader2, User, Users, Baby, FileText, AlertCircle } from "lucide-react";
import { educationLevels, formatMaritalStatus } from "@/lib/registrationValidation";

export function Step5Review() {
  const router = useRouter();
  const {
    applicantInfo,
    maritalStatus,
    spouseInfo,
    numberOfChildren,
    children,
    documents,
    previousStep,
    resetForm,
  } = useRegistrationFormStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submissionToken, setSubmissionToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  // 🔒 Generate one-time submission token when reaching review page
  useEffect(() => {
    const generateToken = async () => {
      try {
        setIsLoadingToken(true);
        setTokenError(null);

        // Early return if applicantInfo is missing
        if (!applicantInfo?.email) {
          setTokenError("Missing applicant information. Please complete Step 1.");
          setIsLoadingToken(false);
          return;
        }

        // 🔧 FIX: Check sessionStorage for existing token (survives React Strict Mode remounts)
        const sessionKey = `submission_token_${applicantInfo.email}`;
        const sessionTimeKey = `submission_token_time_${applicantInfo.email}`;
        
        if (typeof window !== "undefined") {
          const existingToken = sessionStorage.getItem(sessionKey);
          const tokenTime = sessionStorage.getItem(sessionTimeKey);
          
          // Check if token exists and is not too old (max 30 minutes)
          if (existingToken && tokenTime) {
            const tokenAge = Date.now() - parseInt(tokenTime);
            const MAX_TOKEN_AGE = 30 * 60 * 1000; // 30 minutes
            
            if (tokenAge < MAX_TOKEN_AGE) {
              console.log(`⏭️ Using existing token from session (age: ${Math.floor(tokenAge / 1000)}s)`);
              setSubmissionToken(existingToken);
              setIsLoadingToken(false);
              return;
            } else {
              console.log("⚠️ Session token expired, generating new one");
              sessionStorage.removeItem(sessionKey);
              sessionStorage.removeItem(sessionTimeKey);
            }
          }
        }

        console.log("🎫 Generating new submission token...");
        const response = await fetch("/api/generate-submission-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: applicantInfo.email,
            phone: applicantInfo.phone,
            firstName: applicantInfo.firstName,
            lastName: applicantInfo.lastName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Check if already submitted
          if (response.status === 409) {
            setTokenError(
              `This registration has already been submitted on ${data.submittedAt}. Registration ID: ${data.registrationId}`
            );
          } else {
            setTokenError(data.error || "Failed to prepare submission");
          }
          return;
        }

        // Save token to both state and sessionStorage (with timestamp)
        setSubmissionToken(data.submissionToken);
        if (typeof window !== "undefined") {
          const sessionKey = `submission_token_${applicantInfo.email}`;
          const sessionTimeKey = `submission_token_time_${applicantInfo.email}`;
          sessionStorage.setItem(sessionKey, data.submissionToken);
          sessionStorage.setItem(sessionTimeKey, Date.now().toString());
        }
        console.log(`✅ Submission token generated: ${data.submissionToken.substring(0, 8)}...`);
      } catch (error) {
        console.error("❌ Failed to generate submission token:", error);
        setTokenError("Failed to prepare submission. Please try again.");
      } finally {
        setIsLoadingToken(false);
      }
    };

    generateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - generate only once on mount

  const handleSubmit = async () => {
    // Prevent submission without token
    if (!submissionToken) {
      setTokenError("Submission token not ready. Please wait or refresh the page.");
      return;
    }

    // Prevent submission without applicant info
    if (!applicantInfo?.email) {
      setTokenError("Missing applicant information. Please complete Step 1.");
      return;
    }
    setIsSubmitting(true);

    try {
      // Prepare FormData for submission
      const formData = new FormData();

      // Add JSON data
      formData.append("applicantInfo", JSON.stringify(applicantInfo));
      formData.append("maritalStatus", maritalStatus || "");
      if (spouseInfo) {
        formData.append("spouseInfo", JSON.stringify(spouseInfo));
      }
      formData.append("children", JSON.stringify(children));
      
      // 🔒 Add submission token (one-time use)
      formData.append("submissionToken", submissionToken);

      // Add applicant documents
      if (documents.applicant.photo) {
        formData.append("applicant_photo", documents.applicant.photo);
      }
      if (documents.applicant.passport) {
        formData.append("applicant_passport", documents.applicant.passport);
      }
      if (documents.applicant.educationDoc) {
        formData.append("applicant_education", documents.applicant.educationDoc);
      }

      // Add spouse documents (if married)
      if (maritalStatus === "married" && documents.spouse) {
        if (documents.spouse.photo) {
          formData.append("spouse_photo", documents.spouse.photo);
        }
        if (documents.spouse.passport) {
          formData.append("spouse_passport", documents.spouse.passport);
        }
        if (documents.spouse.educationDoc) {
          formData.append("spouse_education", documents.spouse.educationDoc);
        }
        if (documents.spouse.marriageCert) {
          formData.append("spouse_marriage_cert", documents.spouse.marriageCert);
        }
      }

      // Add children documents
      children.forEach((child) => {
        if (!child.isUSCitizenOrLPR && documents.children[child.id]) {
          const childDocs = documents.children[child.id];
          
          if (childDocs.photo) {
            formData.append(`child_${child.id}_photo`, childDocs.photo);
          }
          if (childDocs.passport) {
            formData.append(`child_${child.id}_passport`, childDocs.passport);
          }
          if (childDocs.birthCert) {
            formData.append(`child_${child.id}_birth_cert`, childDocs.birthCert);
          }
        }
      });

      console.log("📤 Submitting registration...");

      // Submit to backend
      const response = await fetch("/api/submit-registration", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }

      const result = await response.json();
      console.log("✅ Registration submitted successfully:", result.registrationId);

      // Clear localStorage and sessionStorage after successful submission
      // 🔒 Clear form state and prevent back navigation
      if (typeof window !== "undefined") {
        localStorage.removeItem("drsi-registration-form");
        
        // Clear submission token and timestamp from sessionStorage
        const sessionKey = `submission_token_${applicantInfo.email}`;
        const sessionTimeKey = `submission_token_time_${applicantInfo.email}`;
        sessionStorage.removeItem(sessionKey);
        sessionStorage.removeItem(sessionTimeKey);
        console.log("🧹 Cleared submission token from session");
        
        // Replace history state to prevent back navigation
        window.history.replaceState(null, "", "/register/success");
      }

      // Reset Zustand store
      resetForm();

      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push("/register/success");
      }, 2000);
    } catch (error: any) {
      console.error("❌ Submission error:", error);
      setIsSubmitting(false);
      
      alert(
        `Failed to submit registration:\n\n${error.message}\n\nPlease check your internet connection and try again. If the problem persists, contact support.`
      );
    }
  };

  const getEducationLabel = (value: string) => {
    return educationLevels.find((level) => level.value === value)?.label || value;
  };

  // 🔒 Show loading state while generating submission token
  if (isLoadingToken) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
        <CardContent className="pt-12 pb-12 text-center">
          <Loader2 className="h-16 w-16 text-[#B02828] mx-auto mb-6 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Preparing Your Submission...</h2>
          <p className="text-gray-600">
            Please wait while we prepare your registration for submission.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 🔒 Show error if token generation failed or already submitted
  if (tokenError) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
        <CardContent className="pt-12 pb-12 text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Submit</h2>
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
            <AlertDescription>{tokenError}</AlertDescription>
          </Alert>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mb-6">
            <p className="text-sm text-blue-800">
              <strong>Starting a new registration?</strong> Clear your previous data to begin fresh.
            </p>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="outline" onClick={() => router.push("/")}>
              Return to Home
            </Button>
            <Button 
              variant="default"
              className="bg-[#B02828] hover:bg-[#8B1F1F] text-white"
              onClick={() => {
                // Clear localStorage and reset form
                if (typeof window !== "undefined") {
                  localStorage.removeItem("drsi-registration-form");
                  console.log("🧹 Cleared localStorage - Starting fresh");
                }
                resetForm();
                router.push("/register");
              }}
            >
              Start Fresh Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submitSuccess) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for completing your DV Lottery registration. We have received your application and
            supporting documents.
          </p>
          <p className="text-gray-500 mb-6">Redirecting to success page...</p>
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription>
              <strong>Next Steps:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>You will receive a confirmation email within 24 hours</li>
                <li>Our team will review your documents</li>
                <li>We will contact you if additional information is needed</li>
                <li>Your application will be submitted to the US government</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-[#B02828] to-[#8B1F1F] text-white">
        <CardTitle className="text-2xl">Review & Submit</CardTitle>
        <CardDescription className="text-gray-100">
          Please review all information before submitting
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Applicant Information */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-[#B02828]" />
              <h3 className="text-lg font-semibold text-gray-900">Applicant Information</h3>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-700">Full Name</dt>
                <dd className="text-gray-900">{applicantInfo?.firstName} {applicantInfo?.lastName}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Email</dt>
                <dd className="text-gray-900">{applicantInfo?.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Phone</dt>
                <dd className="text-gray-900">{applicantInfo?.phone}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Date of Birth</dt>
                <dd className="text-gray-900">
                  {applicantInfo?.dateOfBirth.day}/{applicantInfo?.dateOfBirth.month}/
                  {applicantInfo?.dateOfBirth.year}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Gender</dt>
                <dd className="text-gray-900 capitalize">{applicantInfo?.gender}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Birth Place</dt>
                <dd className="text-gray-900">
                  {applicantInfo?.cityOfBirth}, {applicantInfo?.countryOfBirth}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-700">Mailing Address</dt>
                <dd className="text-gray-900">{applicantInfo?.mailingAddress}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-700">Education Level</dt>
                <dd className="text-gray-900">{getEducationLabel(applicantInfo?.educationLevel || "")}</dd>
              </div>
              
              {/* Current Residence */}
              <div className="sm:col-span-2 pt-4 border-t">
                <h4 className="font-semibold text-md mb-2 text-gray-800">Current Residence</h4>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-gray-700">Street Address</dt>
                <dd className="text-gray-900">{applicantInfo?.currentResidence?.streetAddress}</dd>
                {applicantInfo?.currentResidence?.streetAddress2 && (
                  <>
                    <dt className="font-medium text-gray-700 mt-1">Street Address Line 2</dt>
                    <dd className="text-gray-900">{applicantInfo.currentResidence.streetAddress2}</dd>
                  </>
                )}
              </div>
              <div>
                <dt className="font-medium text-gray-700">City</dt>
                <dd className="text-gray-900">{applicantInfo?.currentResidence?.city}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">State/Province</dt>
                <dd className="text-gray-900">{applicantInfo?.currentResidence?.stateProvince}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Postal/Zip Code</dt>
                <dd className="text-gray-900">{applicantInfo?.currentResidence?.postalCode}</dd>
              </div>
            </dl>
          </div>

          {/* Marital Status & Spouse */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-[#B02828]" />
              <h3 className="text-lg font-semibold text-gray-900">Marital Status</h3>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-700">Status</dt>
                <dd className="text-gray-900">{formatMaritalStatus(maritalStatus)}</dd>
              </div>
              {maritalStatus === "married" && spouseInfo && (
                <>
                  <div className="pt-3 border-t">
                    <dt className="font-medium text-gray-700 mb-2">Spouse Information</dt>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <dt className="font-medium text-gray-700">Full Name</dt>
                      <dd className="text-gray-900">{spouseInfo.fullName}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-700">Date of Birth</dt>
                      <dd className="text-gray-900">
                        {spouseInfo.dateOfBirth.day}/{spouseInfo.dateOfBirth.month}/
                        {spouseInfo.dateOfBirth.year}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-700">Gender</dt>
                      <dd className="text-gray-900 capitalize">{spouseInfo.gender}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-700">Birth Place</dt>
                      <dd className="text-gray-900">
                        {spouseInfo.cityOfBirth}, {spouseInfo.countryOfBirth}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-gray-700">Education Level</dt>
                      <dd className="text-gray-900">{getEducationLabel(spouseInfo.educationLevel)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-gray-700">U.S. Citizen or Green Card Holder</dt>
                      <dd className="text-gray-900">{spouseInfo.isUSCitizenOrLPR ? "Yes" : "No"}</dd>
                    </div>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Children */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <Baby className="h-5 w-5 text-[#B02828]" />
              <h3 className="text-lg font-semibold text-gray-900">Children</h3>
            </div>
            {numberOfChildren === 0 ? (
              <p className="text-sm text-gray-600">No children under 21</p>
            ) : (
              <div className="space-y-4">
                {children.map((child, index) => (
                  <div key={child.id} className="border-t pt-3 first:border-t-0 first:pt-0">
                    <p className="font-medium text-gray-900 mb-2">Child {index + 1}</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="font-medium text-gray-700">Full Name</dt>
                        <dd className="text-gray-900">{child.fullName}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700">Date of Birth</dt>
                        <dd className="text-gray-900">
                          {child.dateOfBirth.day}/{child.dateOfBirth.month}/{child.dateOfBirth.year}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700">Gender</dt>
                        <dd className="text-gray-900 capitalize">{child.gender}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-700">Birth Place</dt>
                        <dd className="text-gray-900">{child.birthPlace}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-gray-700">US Citizen/LPR</dt>
                        <dd className="text-gray-900">{child.isUSCitizenOrLPR ? "Yes" : "No"}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents Summary */}
          <div className="border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[#B02828]" />
              <h3 className="text-lg font-semibold text-gray-900">Documents Uploaded</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Applicant Documents</span>
                <span className="font-medium">
                  {Object.values(documents.applicant).filter(Boolean).length} / 3 uploaded
                </span>
              </div>
              {maritalStatus === "married" && (
                <div className="flex justify-between">
                  <span>Spouse Documents</span>
                  <span className="font-medium">
                    {documents.spouse ? Object.values(documents.spouse).filter(Boolean).length : 0} / 4
                    uploaded
                  </span>
                </div>
              )}
              {children.length > 0 && (
                <div className="flex justify-between">
                  <span>Children Documents</span>
                  <span className="font-medium">
                    {Object.values(documents.children).reduce(
                      (acc, childDocs) => acc + Object.values(childDocs || {}).filter(Boolean).length,
                      0
                    )}{" "}
                    / {children.filter((c) => !c.isUSCitizenOrLPR).length * 3} uploaded
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertDescription>
              <strong>Important:</strong> By submitting this application, you confirm that all information
              provided is accurate and complete. False information may result in disqualification from the DV
              Lottery program.
            </AlertDescription>
          </Alert>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              onClick={previousStep}
              variant="outline"
              size="lg"
              className="px-8"
              disabled={isSubmitting}
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              size="lg"
              className="bg-[#B02828] hover:bg-[#8B1F1F] text-white px-8"
              disabled={isSubmitting || !submissionToken}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : !submissionToken ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


