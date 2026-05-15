const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(
  endpoint: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token: tokenOverride, ...fetchOptions } = options;
  const token = tokenOverride !== undefined ? tokenOverride : localStorage.getItem('auth_token');

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.dispatchEvent(new Event('auth:logout'));
  }

  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  return data as T;
}

// ── Auth ──

export function sendOtp(email: string) {
  return request<{ message: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function verifyOtp(email: string, code: string) {
  return request<{
    message: string;
    token: string;
    user: { id: number; name: string; email: string };
  }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export function logout() {
  return request<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}

// ── Application ──

export interface DocumentRecord {
  id: number;
  document_type: string;
  /** Phase 3.1b: index within a document_type, for multi-upload (e.g. "Add another passport"). */
  document_index?: number;
  file_path: string;
  original_name: string;
  mime_type: string | null;
  size: number;
  needs_translation: boolean;
  admin_comment: string | null;
  document_status: 'pending' | 'approved' | 'rejected';
}

export function getApplication(token?: string | null) {
  return request<{
    id?: number;
    status: string | null;
    form_data: Record<string, unknown> | null;
    stage1_submitted_at?: string | null;
    documents?: DocumentRecord[];
  }>(`/application?_=${Date.now()}`, {
    cache: 'no-store',
    ...(token != null && { token }),
  });
}

export function saveProgress(formData: Record<string, unknown>) {
  return request<{ message: string; id: number; status: string }>('/application/save-progress', {
    method: 'PUT',
    body: JSON.stringify({ form_data: formData }),
  });
}

export function uploadDocument(
  file: File,
  documentType: string,
  needsTranslation = false,
  documentIndex = 0,
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  // Phase 3.1b: multi-upload support. Default index = 0 for single-slot docs.
  formData.append('document_index', String(documentIndex));
  formData.append('needs_translation', needsTranslation ? '1' : '0');

  return request<{
    message: string;
    document: DocumentRecord;
  }>('/application/upload-document', {
    method: 'POST',
    body: formData,
  });
}

export function updateDocumentTranslation(documentType: string, needsTranslation: boolean) {
  return request<{
    message: string;
    document: DocumentRecord;
  }>('/application/document-translation', {
    method: 'PATCH',
    body: JSON.stringify({ document_type: documentType, needs_translation: needsTranslation }),
  });
}

export function submitStage1() {
  return request<{ message: string; status: string }>('/application/submit-stage-1', {
    method: 'POST',
  });
}

export function submitStage2() {
  return request<{ message: string; status: string }>('/application/submit-stage-2', {
    method: 'POST',
  });
}
