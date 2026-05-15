import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormStore, type Step8DocumentUpload } from '@/lib/store/formStore';
import { useDynamicLabels } from '@/lib/useDynamicLabels';
import {
  getDocumentsForApplication,
  CATEGORY_HEADINGS,
  type ResolvedDocument,
  type DocCategory,
  type DocContext,
} from '@/lib/documentRequirements';
import { uploadDocument as apiUploadDocument, updateDocumentTranslation, type DocumentRecord } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, CheckCircle2, AlertCircle, Loader2, FileText, XCircle, Eye } from 'lucide-react';
import { DocumentViewer } from '@/components/DocumentViewer';

interface Step8DocumentsProps {
  onBack: () => void;
  onContinue: () => void;
  submitting?: boolean;
  /** Documents loaded from the backend during hydration */
  serverDocuments?: DocumentRecord[];
  /** True when user is in "needs revision" mode (post-submission, document rejected) */
  revisionMode?: boolean;
}

export function Step8Documents({ onBack, onContinue, submitting, serverDocuments = [], revisionMode = false }: Step8DocumentsProps) {
  const { caseType, step8Documents, setStep8Documents, step3Data, petitionerCitizenshipStatus } = useFormStore();
  const { petitionerName, beneficiaryName, petitionerFirstName, beneficiaryFirstName } = useDynamicLabels();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  // Phase 3.1c: per-requirement extra slots count (beyond the default 1) — only for multi: true.
  const [extraSlots, setExtraSlots] = useState<Record<string, number>>({});

  // Guard: no case type selected
  if (!caseType) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Type Required</h3>
        <p className="text-gray-600 mb-4">Please go back to Step 0 and select your case type first.</p>
        <Button variant="outline" onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  // Build the context that drives the dynamic document list.
  // Passing firstName into the labels lets Meir see "Meir: US Passport" instead of "Petitioner: US Passport".
  // Normalise legacy 'child' to 'child_minor' for the DocContext (Phase 2.2 compat)
  const normalizedCaseType: 'spouse' | 'child_minor' | 'child_adult' | 'parent' =
    caseType === 'child' ? 'child_minor' : caseType;
  const ctx: DocContext = {
    caseType: normalizedCaseType,
    citizenshipStatus: petitionerCitizenshipStatus,
    petitionerFirstName,
    beneficiaryFirstName,
    numberOfAllChildren: step3Data.beneficiary?.numberOfAllChildren ?? 0,
    children: (step3Data.beneficiary?.children ?? []).map((c) => ({
      nameSurname: c.nameSurname,
      isUSCitizen: (c as { isUSCitizen?: boolean | null }).isUSCitizen ?? null,
    })),
    priorMarriagesPetitioner: step3Data.petitioner?.maritalStatus?.priorMarriages?.length ?? 0,
    priorMarriagesBeneficiary: step3Data.beneficiary?.maritalStatus?.priorMarriages?.length ?? 0,
  };
  const requirements = getDocumentsForApplication(ctx);
  const uploads = step8Documents.uploads;

  // Group by category so the UI can render section headings
  const grouped: Record<DocCategory, ResolvedDocument[]> = {
    petitioner: [], beneficiary: [], children: [], bonafide: [], interview_originals: [],
  };
  for (const r of requirements) grouped[r.category].push(r);

  // Merge server documents into local view (server takes precedence for status/comments)
  const getDocStatus = (docId: string): { upload?: Step8DocumentUpload; server?: DocumentRecord } => {
    const local = uploads[docId];
    const server = serverDocuments.find((d) => d.document_type === docId);
    return { upload: local, server };
  };

  const uploadedCount = requirements.filter((r) => {
    const { upload, server } = getDocStatus(r.id);
    return upload || server;
  }).length;
  const requiredCount = requirements.filter((r) => r.required).length;
  const progressPercent = requiredCount > 0
    ? Math.min(100, Math.round((uploadedCount / requiredCount) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Revision mode alert banner */}
      {revisionMode && (
        <div className="rounded-lg border-2 border-red-400 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-red-800">
                Action Required: Document Revision Needed
              </h4>
              <p className="text-sm text-red-700 mt-1">
                One or more of your documents were rejected by our team. Please review the comments in red below and re-upload the corrected files. Once all documents are updated, click "Resubmit Documents" to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Document Upload Progress
          </span>
          <span className="text-sm text-gray-500">
            {uploadedCount} of {requiredCount} required documents uploaded
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              progressPercent === 100 ? 'bg-green-500' : 'bg-[#b72b2b]'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{progressPercent}% complete</p>
      </div>

      {/* Personalization note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        Showing documents required for <strong>{caseType === 'spouse' ? 'Spouse' : caseType === 'child' ? 'Unmarried Child' : 'Parent'}</strong> petition.
        {petitionerName !== 'Petitioner' && <> Petitioner: <strong>{petitionerName}</strong>.</>}
        {beneficiaryName !== 'Beneficiary' && <> Beneficiary: <strong>{beneficiaryName}</strong>.</>}
      </div>

      {/* Document list — grouped by category with section headings */}
      <div className="space-y-6">
        {(['petitioner', 'beneficiary', 'children', 'bonafide', 'interview_originals'] as DocCategory[]).map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          return (
            <section key={cat} className="space-y-3">
              <h4 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {CATEGORY_HEADINGS[cat]}
              </h4>
              {items.map((req) => {
                // For multi-upload docs, determine how many slots to render:
                //   max of (1, existing server slots for this type, extra slots added locally)
                const serverSlotCount = serverDocuments.filter((d) => d.document_type === req.id).length;
                const extras = extraSlots[req.id] ?? 0;
                const totalSlots = req.multi
                  ? Math.max(1, serverSlotCount, 1 + extras)
                  : 1;
                // Per-slot unique key in uploads — index 0 uses the legacy bare `req.id` so
                // existing local uploads still render in slot 0.
                const slotKey = (idx: number) => (idx === 0 ? req.id : `${req.id}__${idx}`);

                return (
                  <div key={req.id} className="space-y-2">
                    {Array.from({ length: totalSlots }).map((_, idx) => {
                      const key = slotKey(idx);
                      const serverDoc = serverDocuments
                        .filter((d) => d.document_type === req.id)
                        .find((d) => (d.document_index ?? 0) === idx);
                      return (
                        <DocumentRow
                          key={key}
                          requirement={{
                            ...req,
                            // For slot > 0, append "(extra N)" to label so user can tell them apart
                            label: idx === 0 ? req.label : `${req.label} — copy ${idx + 1}`,
                          }}
                          upload={uploads[key]}
                          serverDoc={serverDoc}
                          uploading={uploadingId === key}
                          onUpload={async (file) => {
                            setUploadingId(key);
                            try {
                              const needsTranslation = uploads[key]?.needsTranslation ?? false;
                              const res = await apiUploadDocument(file, req.id, needsTranslation, idx);
                              setStep8Documents({
                                uploads: {
                                  [key]: {
                                    fileName: file.name,
                                    fileSize: file.size,
                                    path: res.document.file_path,
                                    needsTranslation,
                                    documentStatus: res.document.document_status,
                                    adminComment: res.document.admin_comment,
                                  },
                                },
                              });
                            } catch (err) {
                              console.error('Upload failed:', err);
                              alert('Upload failed. Please try again.');
                            } finally {
                              setUploadingId(null);
                            }
                          }}
                          onTranslationToggle={async (checked) => {
                            const existing = uploads[key] || {};
                            setStep8Documents({
                              uploads: {
                                [key]: { ...existing, needsTranslation: checked } as Step8DocumentUpload,
                              },
                            });
                            if (uploads[key]?.path) {
                              try { await updateDocumentTranslation(req.id, checked); } catch { /* silent */ }
                            }
                          }}
                        />
                      );
                    })}
                    {/* Add another — only for multi-upload-enabled documents */}
                    {req.multi && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs border-dashed border-[#b72b2b]/40 text-[#b72b2b] hover:bg-red-50/50"
                        onClick={() => setExtraSlots((prev) => ({ ...prev, [req.id]: (prev[req.id] ?? 0) + 1 }))}
                      >
                        + Add another {req.label.replace(/^.*?:\s*/, '').toLowerCase()}
                      </Button>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        {!revisionMode ? (
          <Button type="button" variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="button"
          onClick={onContinue}
          disabled={submitting}
          className="bg-[#b72b2b] hover:bg-[#9a2424] text-white px-8"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {revisionMode ? 'Resubmitting...' : 'Submitting...'}
            </span>
          ) : revisionMode ? (
            'Resubmit Documents'
          ) : (
            'Submit Application'
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Individual Document Row ──

function DocumentRow({
  requirement,
  upload,
  serverDoc,
  uploading,
  onUpload,
  onTranslationToggle,
}: {
  requirement: ResolvedDocument;
  upload?: Step8DocumentUpload;
  serverDoc?: DocumentRecord;
  uploading: boolean;
  onUpload: (file: File) => void;
  onTranslationToggle: (checked: boolean) => void;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
  });

  const [viewerOpen, setViewerOpen] = useState(false);
  const hasFile = !!(upload?.fileName || serverDoc);
  const fileName = upload?.fileName || serverDoc?.original_name;
  const fileSize = upload?.fileSize || serverDoc?.size;
  const needsTranslation = upload?.needsTranslation ?? serverDoc?.needs_translation ?? false;
  // Only server-backed documents have an ID we can fetch from the viewer endpoint
  const canView = !!serverDoc?.id;

  // Determine status
  const status = upload?.documentStatus || serverDoc?.document_status || (hasFile ? 'pending' : undefined);
  const adminComment = upload?.adminComment ?? serverDoc?.admin_comment;
  const isRejected = status === 'rejected';
  const isApproved = status === 'approved';

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-colors',
      isRejected ? 'border-red-300 bg-red-50/50' :
        isApproved ? 'border-green-300 bg-green-50/50' :
          'border-gray-200 bg-gray-50/50'
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-gray-900">
              {requirement.label}
              {requirement.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>

          {/* File info */}
          {hasFile && (
            <div className="mt-1 flex items-center gap-2 text-xs">
              {isApproved && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
              {isRejected && <XCircle className="h-3.5 w-3.5 text-red-600" />}
              {status === 'pending' && <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />}
              <span className="text-gray-500 truncate">{fileName}</span>
              {fileSize && (
                <span className="text-gray-400">({(fileSize / 1024).toFixed(0)} KB)</span>
              )}
              {status && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
                  isApproved ? 'bg-green-100 text-green-700' :
                    isRejected ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                )}>
                  {status}
                </span>
              )}
            </div>
          )}

          {/* Admin comment (rejected) */}
          {isRejected && adminComment && (
            <div className="mt-2 text-xs text-red-700 bg-red-100 rounded px-2 py-1.5">
              <strong>Admin feedback:</strong> {adminComment}
            </div>
          )}
        </div>

        {/* View + Upload controls */}
        <div className="flex items-center gap-2">
          {canView && (
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 hover:border-[#b72b2b] hover:text-[#b72b2b] px-3 py-2 text-xs text-gray-600 transition-colors"
              title="Preview this document inline"
            >
              <Eye className="h-4 w-4" /> View
            </button>
          )}
          <div
            {...getRootProps()}
            className={cn(
              'flex items-center justify-center rounded-md border-2 border-dashed px-4 py-3 cursor-pointer transition-colors text-center min-w-[140px]',
              isDragActive ? 'border-[#b72b2b] bg-red-50' :
                hasFile ? 'border-gray-300 hover:border-gray-400' :
                  'border-gray-300 hover:border-[#b72b2b]'
            )}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#b72b2b]" />
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Upload className="h-4 w-4" />
                <span>{hasFile ? 'Replace' : 'Upload'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewerOpen && serverDoc && (
        <DocumentViewer
          documentId={serverDoc.id}
          fileName={serverDoc.original_name}
          mimeType={serverDoc.mime_type ?? undefined}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {/* Translation checkbox */}
      {requirement.translationEligible && (
        <div className="mt-3 flex items-start gap-2">
          <input
            type="checkbox"
            id={`translate-${requirement.id}`}
            checked={needsTranslation}
            onChange={(e) => onTranslationToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#b72b2b] focus:ring-[#b72b2b] mt-0.5"
          />
          <label htmlFor={`translate-${requirement.id}`} className="text-xs text-gray-600 cursor-pointer leading-snug">
            Document is not in English — Please translate it for me at an additional cost
          </label>
        </div>
      )}
    </div>
  );
}
