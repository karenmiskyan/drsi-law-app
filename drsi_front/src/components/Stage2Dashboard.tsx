import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2Icon, FileCheck, ChevronDown, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadDocument, submitStage2 } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import {
  SPONSOR_DOCUMENTS,
  BENEFICIARY_DOCUMENTS,
  INTENT_DOCUMENTS,
  INTERVIEW_ORIGINALS,
} from '@/lib/stage2Documents';
import type { Stage2DocItem } from '@/lib/stage2Documents';

const ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
};
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function DocumentUploadRow({
  item,
  fileName,
  isUploading,
  onUpload,
  onRemove,
}: {
  item: Stage2DocItem;
  fileName?: string;
  isUploading?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onUpload(acceptedFiles[0]);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled: !!fileName || !!isUploading,
  });

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-sm transition-colors flex flex-col sm:flex-row sm:items-start gap-4',
        fileName
          ? 'border-green-400 bg-green-50/80'
          : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
      )}
    >
      <div className="flex-1 min-w-0">
        <Label className="text-base font-medium text-gray-800 block break-words leading-snug">
          {item.linkUrl && item.linkText && item.label.includes(item.linkText) ? (
            <>
              {item.label.split(item.linkText)[0]}
              <a
                href={item.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#b72b2b] hover:underline font-medium"
              >
                {item.linkText}
              </a>
              {item.label.split(item.linkText).slice(1).join(item.linkText)}
            </>
          ) : (
            item.label
          )}
        </Label>
        {item.subNote && (
          <p className="mt-2 text-sm text-gray-600 italic break-words leading-snug">
            {item.subNoteLinkUrl && item.subNoteLinkText && item.subNote.includes(item.subNoteLinkText) ? (
              <>
                {item.subNote.split(item.subNoteLinkText)[0]}
                <a
                  href={item.subNoteLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#b72b2b] hover:underline font-medium"
                >
                  {item.subNoteLinkText}
                </a>
                {item.subNote.split(item.subNoteLinkText).slice(1).join(item.subNoteLinkText)}
              </>
            ) : (
              item.subNote
            )}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto sm:min-w-[140px]">
        {fileName ? (
          <>
            <div className="flex items-start gap-2 flex-1 min-h-0">
              <FileCheck className="size-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium break-words flex-1 min-w-0" title={fileName}>
                {fileName}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs shrink-0 w-fit"
              onClick={onRemove}
            >
              <Trash2Icon className="size-4 mr-1" />
              Remove
            </Button>
          </>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              'cursor-pointer rounded border-2 border-dashed px-4 py-3 text-sm transition-colors flex-1 flex items-center justify-center',
              isDragActive
                ? 'border-[#b72b2b] bg-red-50/50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDragActive ? 'Drop here' : 'Upload'}
          </div>
        )}
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="border-b border-gray-200 last:border-b-0 group"
      open={defaultOpen}
    >
      <summary className="flex items-center justify-between py-4 font-medium text-left cursor-pointer list-none hover:underline [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pb-4 pt-0">{children}</div>
    </details>
  );
}

export function Stage2Dashboard() {
  const [uploads, setUploads] = useState<Record<string, { fileName: string; fileSize: number; path?: string }>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submittingStage2, setSubmittingStage2] = useState(false);
  const setApplicationStatus = useAuthStore((s) => s.setApplicationStatus);

  const handleSubmitStage2 = useCallback(async () => {
    if (!confirm('Are you sure you want to submit your Stage 2 documents for review? You will not be able to make changes after submission.')) return;
    setSubmittingStage2(true);
    try {
      const res = await submitStage2();
      setApplicationStatus(res.status);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmittingStage2(false);
    }
  }, [setApplicationStatus]);

  const updateUpload = useCallback(async (id: string, file?: File) => {
    if (!file) {
      setUploads((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    setUploading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await uploadDocument(file, id);
      setUploads((prev) => ({
        ...prev,
        [id]: { fileName: file.name, fileSize: file.size, path: res.document.file_path },
      }));
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  const renderUploadSection = (items: Stage2DocItem[]) => (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item) => (
        <DocumentUploadRow
          key={item.id}
          item={item}
          fileName={uploads[item.id]?.fileName}
          isUploading={uploading[item.id]}
          onUpload={(file) => updateUpload(item.id, file)}
          onRemove={() => updateUpload(item.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-4xl text-center mb-4 px-4">
        <img
          src="/logo/DRSI LAW- grey trsp.png"
          alt="DRSI Law"
          className="mx-auto h-16 sm:h-20 object-contain"
        />
        <p className="text-white/90 text-sm sm:text-base font-medium mt-2">
          D. R. Sklar & Associates Immigration Law Offices
        </p>
        <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">
          FAMILY IMMIGRATION PETITION QUESTIONNAIRE
        </h2>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-4xl">
        <div className="overflow-hidden rounded-xl bg-white shadow-xl">
          {/* Card Header - Dark Red */}
          <div className="bg-[#b72b2b] px-6 py-6 sm:px-8 sm:py-8 rounded-t-xl">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Stage 2 — NVC Document Upload (Post I-130 Approval)
            </h1>
            <p className="mt-2 text-sm text-white/90 sm:text-base">
              Documents required after I-130 petition approval. Upload documents for each section below.
            </p>
          </div>

          {/* Card Body - White */}
          <div className="rounded-b-xl bg-white p-6 sm:p-8">
            <CollapsibleSection title="US Citizen Sponsor Documents">
              <p className="text-sm text-gray-600 mb-4">List of documents required from the US Citizens Sponsor:</p>
              {renderUploadSection(SPONSOR_DOCUMENTS)}
            </CollapsibleSection>

            <CollapsibleSection title="Foreign Beneficiary Documents">
              <p className="text-sm text-gray-600 mb-4">List of documents required from the foreign Beneficiary:</p>
              {renderUploadSection(BENEFICIARY_DOCUMENTS)}
            </CollapsibleSection>

            <CollapsibleSection title="Intent to Establish a Home in the USA">
              <p className="text-sm text-gray-600 mb-4">This will show your intent to relocate to the US.</p>
              {renderUploadSection(INTENT_DOCUMENTS)}
            </CollapsibleSection>

            <CollapsibleSection title="For Your Interview (Originals to Bring)">
              <p className="text-sm text-gray-700 mb-3">For your interview, you&apos;ll need the following in the original:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                {INTERVIEW_ORIGINALS.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </CollapsibleSection>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Once you have uploaded all required documents, submit them for our legal team to review.
                </p>
                <Button
                  type="button"
                  onClick={handleSubmitStage2}
                  disabled={submittingStage2}
                  className="bg-[#b72b2b] hover:bg-[#9a2424] text-white px-8 py-3 text-base font-semibold"
                >
                  {submittingStage2 ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Documents for Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
