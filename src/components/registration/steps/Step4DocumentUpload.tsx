"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRegistrationFormStore } from "@/stores/registrationFormStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight, Upload, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Step4DocumentUpload() {
  const { maritalStatus, children, documents, setDocuments, nextStep, previousStep } =
    useRegistrationFormStore();

  const showSpouseDocuments = maritalStatus === "married";

  // Validation: Check if all required documents are uploaded
  const validateDocuments = (): { isValid: boolean; missing: string[] } => {
    const missing: string[] = [];

    // Applicant documents (always required)
    if (!documents.applicant.photo) missing.push("Applicant Photo");
    if (!documents.applicant.passport) missing.push("Applicant Passport");
    if (!documents.applicant.educationDoc) missing.push("Applicant Education Document");

    // Spouse documents (required if married)
    if (maritalStatus === "married" && documents.spouse) {
      if (!documents.spouse.photo) missing.push("Spouse Photo");
      if (!documents.spouse.passport) missing.push("Spouse Passport");
      if (!documents.spouse.educationDoc) missing.push("Spouse Education Document");
      if (!documents.spouse.marriageCert) missing.push("Marriage Certificate");
    }

    // Children documents (required for each non-US citizen child)
    children.forEach((child, index) => {
      if (!child.isUSCitizenOrLPR) {
        const childDocs = documents.children[child.id];
        if (!childDocs?.photo) missing.push(`Child ${index + 1} Photo`);
        if (!childDocs?.passport) missing.push(`Child ${index + 1} Passport`);
        if (!childDocs?.birthCert) missing.push(`Child ${index + 1} Birth Certificate`);
      }
    });

    return {
      isValid: missing.length === 0,
      missing,
    };
  };

  const handleContinue = () => {
    const validation = validateDocuments();

    if (!validation.isValid) {
      const missingList = validation.missing.join("\n• ");
      alert(
        `⚠️ Please upload all required documents:\n\n• ${missingList}\n\nAll documents are mandatory for application submission.`
      );
      return;
    }

    nextStep();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-[#B02828] to-[#8B1F1F] text-white">
        <CardTitle className="text-2xl">Document Upload</CardTitle>
        <CardDescription className="text-gray-100">
          Upload required documents for all family members
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Instructions */}
          <Alert>
            <AlertDescription>
              <strong>Document Requirements:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Photo: Recent passport-style photo (white background, 600x600 pixels minimum)</li>
                <li>Passport: Clear scan or photo of your passport bio-data page</li>
                <li>Education: Diploma, degree certificate, or transcript</li>
                <li>File formats: JPG, PNG, or PDF (max 10MB each)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Document Upload Accordions */}
          <Accordion type="multiple" className="w-full" defaultValue={["applicant"]}>
            {/* Main Applicant Documents */}
            <AccordionItem value="applicant">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#B02828]" />
                  Main Applicant Documents
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <FileUploadZone
                    label="Passport Photo"
                    file={documents.applicant.photo}
                    onUpload={(file) =>
                      setDocuments({
                        ...documents, // Keep spouse and children
                        applicant: { ...documents.applicant, photo: file },
                      })
                    }
                    required
                  />
                  <FileUploadZone
                    label="Passport"
                    file={documents.applicant.passport}
                    onUpload={(file) =>
                      setDocuments({
                        ...documents,
                        applicant: { ...documents.applicant, passport: file },
                      })
                    }
                    required
                  />
                  <FileUploadZone
                    label="Education Document"
                    file={documents.applicant.educationDoc}
                    onUpload={(file) =>
                      setDocuments({
                        ...documents,
                        applicant: { ...documents.applicant, educationDoc: file },
                      })
                    }
                    required
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Spouse Documents (Conditional) */}
            {showSpouseDocuments && (
              <AccordionItem value="spouse">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#B02828]" />
                    Spouse Documents
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <FileUploadZone
                      label="Spouse Passport Photo"
                      file={documents.spouse?.photo || null}
                      onUpload={(file) =>
                        setDocuments({
                          ...documents, // Keep applicant and children
                          spouse: {
                            photo: file,
                            passport: documents.spouse?.passport || null,
                            educationDoc: documents.spouse?.educationDoc || null,
                            marriageCert: documents.spouse?.marriageCert || null,
                          },
                        })
                      }
                      required
                    />
                    <FileUploadZone
                      label="Spouse Passport"
                      file={documents.spouse?.passport || null}
                      onUpload={(file) =>
                        setDocuments({
                          ...documents,
                          spouse: {
                            passport: file,
                            photo: documents.spouse?.photo || null,
                            educationDoc: documents.spouse?.educationDoc || null,
                            marriageCert: documents.spouse?.marriageCert || null,
                          },
                        })
                      }
                      required
                    />
                    <FileUploadZone
                      label="Spouse Education Document"
                      file={documents.spouse?.educationDoc || null}
                      onUpload={(file) =>
                        setDocuments({
                          ...documents,
                          spouse: {
                            educationDoc: file,
                            photo: documents.spouse?.photo || null,
                            passport: documents.spouse?.passport || null,
                            marriageCert: documents.spouse?.marriageCert || null,
                          },
                        })
                      }
                      required
                    />
                    <FileUploadZone
                      label="Marriage Certificate"
                      file={documents.spouse?.marriageCert || null}
                      onUpload={(file) =>
                        setDocuments({
                          ...documents,
                          spouse: {
                            marriageCert: file,
                            photo: documents.spouse?.photo || null,
                            passport: documents.spouse?.passport || null,
                            educationDoc: documents.spouse?.educationDoc || null,
                          },
                        })
                      }
                      required
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Children Documents (Dynamic) */}
            {children.length > 0 &&
              children.map((child, index) => (
                <AccordionItem key={child.id} value={`child-${child.id}`}>
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#B02828]" />
                      Child {index + 1}: {child.fullName || "Unnamed Child"}
                      {child.isUSCitizenOrLPR && (
                        <span className="text-sm text-blue-600 ml-2">(US Citizen/LPR - Optional)</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <FileUploadZone
                        label="Child Passport Photo"
                        file={documents.children[child.id]?.photo || null}
                        onUpload={(file) =>
                          setDocuments({
                            ...documents, // Keep applicant and spouse
                            children: {
                              ...documents.children,
                              [child.id]: {
                                ...documents.children[child.id],
                                photo: file,
                              },
                            },
                          })
                        }
                        required={!child.isUSCitizenOrLPR}
                      />
                      <FileUploadZone
                        label="Child Passport"
                        file={documents.children[child.id]?.passport || null}
                        onUpload={(file) =>
                          setDocuments({
                            ...documents,
                            children: {
                              ...documents.children,
                              [child.id]: {
                                ...documents.children[child.id],
                                passport: file,
                              },
                            },
                          })
                        }
                        required={!child.isUSCitizenOrLPR}
                      />
                      <FileUploadZone
                        label="Birth Certificate"
                        file={documents.children[child.id]?.birthCert || null}
                        onUpload={(file) =>
                          setDocuments({
                            ...documents,
                            children: {
                              ...documents.children,
                              [child.id]: {
                                ...documents.children[child.id],
                                birthCert: file,
                              },
                            },
                          })
                        }
                        required={!child.isUSCitizenOrLPR}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>

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
              type="button"
              onClick={handleContinue}
              size="lg"
              className="bg-[#B02828] hover:bg-[#8B1F1F] text-white px-8"
            >
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// File Upload Zone Component
interface FileUploadZoneProps {
  label: string;
  file: File | null;
  onUpload: (file: File) => void;
  required?: boolean;
}

function FileUploadZone({ label, file, onUpload, required }: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {file && <CheckCircle2 className="h-5 w-5 text-green-600" />}
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? "border-[#B02828] bg-[#B02828]/5"
              : file
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-[#B02828] hover:bg-gray-50"
          }
        `}
      >
        <input {...getInputProps()} />

        {file ? (
          <div className="space-y-2">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            <p className="text-xs text-[#B02828]">Click or drag to replace</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            {isDragActive ? (
              <p className="text-sm text-[#B02828]">Drop the file here</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Drag & drop or <span className="text-[#B02828] font-medium">click to browse</span>
                </p>
                <p className="text-xs text-gray-500">JPG, PNG, or PDF (max 10MB)</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


