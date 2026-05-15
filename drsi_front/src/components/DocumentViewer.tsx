import { useEffect, useState } from 'react';
import { X, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Inline document previewer — opens a modal with an iframe (for PDFs) or <img>
 * (for images). Downloads the file as a blob using the Bearer token, so there's
 * no way to bypass auth by sharing the URL.
 *
 * Per Meir: "is there a way I can view the doc without downloading it?"
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface DocumentViewerProps {
  documentId: number;
  fileName: string;
  mimeType?: string | null;
  onClose: () => void;
}

export function DocumentViewer({ documentId, fileName, mimeType, onClose }: DocumentViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentBlobUrl: string | null = null;
    let cancelled = false;

    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE}/application/document/${documentId}/view`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const blob = await res.blob();
        if (cancelled) return;
        currentBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(currentBlobUrl);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load document');
      }
    })();

    // Cleanup: revoke blob URL when modal closes
    return () => {
      cancelled = true;
      if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    };
  }, [documentId]);

  const isPdf = (mimeType ?? '').includes('pdf') || fileName.toLowerCase().endsWith('.pdf');
  const isImage = (mimeType ?? '').startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 truncate flex-1 pr-4" title={fileName}>
            {fileName}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && (
              <a
                href={blobUrl}
                download={fileName}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#b72b2b] px-3 py-1.5 rounded-md border border-gray-300 hover:border-[#b72b2b] transition-colors"
              >
                <Download className="h-4 w-4" /> Download
              </a>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {error ? (
            <div className="text-center p-8">
              <p className="text-red-600 font-medium">Failed to load document</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
          ) : !blobUrl ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading preview…
            </div>
          ) : isPdf ? (
            <iframe src={blobUrl} className="w-full h-full border-0" title={fileName} />
          ) : isImage ? (
            <img src={blobUrl} alt={fileName} className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-700">Preview not supported for this file type.</p>
              <p className="text-sm text-gray-500 mt-2">Use the Download button above to save the file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
