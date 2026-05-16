const API_BASE = import.meta.env.VITE_GATEWAY_URL ?? "";

const TOKEN_KEY = "dms_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (extra) {
    Object.assign(headers, extra as Record<string, string>);
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export interface AuthLoginResponse {
  token: string;
  userId: string;
  email: string;
  roles: string[];
  departmentIds: string[];
}

export interface BackendDepartment {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

export interface BackendCategory {
  id: string;
  name: string;
}

export interface BackendUser {
  id: string;
  email: string;
  roles: string[];
  departmentIds: string[];
}

export interface BackendDocument {
  id: string;
  title: string;
  description: string;
  hasFile?: boolean;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  objectKey?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerEmail?: string;
  departmentId?: string;
  categoryId?: string;
  categoryName?: string;
  translatedTitle?: string;
}

export interface BackendComment {
  id?: string;
  docId: string;
  author: string;
  content: string;
  timestamp?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  fileName: string;
  contentType?: string;
}

export async function login(email: string, password: string): Promise<AuthLoginResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function registerUser(payload: {
  email: string;
  password: string;
  roles?: string[];
}): Promise<BackendUser> {
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getDepartments(): Promise<BackendDepartment[]> {
  const response = await fetch(`${API_BASE}/api/admin/departments`, { headers: authHeaders() });
  return handleResponse(response);
}

export async function createDepartment(name: string, description: string): Promise<BackendDepartment> {
  const response = await fetch(`${API_BASE}/api/admin/departments`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
}

export async function deleteDepartment(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/departments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse(response);
}

export async function getCategories(): Promise<BackendCategory[]> {
  const response = await fetch(`${API_BASE}/api/admin/categories`, { headers: authHeaders() });
  return handleResponse(response);
}

export async function createCategory(name: string): Promise<BackendCategory> {
  const response = await fetch(`${API_BASE}/api/admin/categories`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function getUsers(): Promise<BackendUser[]> {
  const response = await fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders() });
  return handleResponse(response);
}

export async function assignUserDepartments(userId: string, departmentIds: string[]): Promise<BackendUser> {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/departments`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ departmentIds }),
  });
  return handleResponse(response);
}

export async function getDocuments(): Promise<BackendDocument[]> {
  const response = await fetch(`${API_BASE}/api/documents/list`, { headers: authHeaders() });
  return handleResponse(response);
}

export async function getDocumentById(id: string): Promise<BackendDocument> {
  const response = await fetch(`${API_BASE}/api/documents/get/${id}`, { headers: authHeaders() });
  return handleResponse(response);
}

export async function createDocument(payload: {
  title: string;
  description: string;
  departmentId: string;
  categoryId?: string;
  categoryName?: string;
}): Promise<BackendDocument> {
  const response = await fetch(`${API_BASE}/api/documents/add`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function requestDocumentUploadUrl(
  documentId: string,
  fileName: string,
  contentType: string
): Promise<PresignedUploadResponse> {
  const response = await fetch(
    `${API_BASE}/api/documents/${documentId}/upload-url?filename=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`,
    { headers: authHeaders() }
  );
  return handleResponse(response);
}

export async function confirmDocumentUpload(
  documentId: string,
  payload: { fileName: string; fileSize: number; contentType: string }
): Promise<BackendDocument> {
  const response = await fetch(`${API_BASE}/api/documents/${documentId}/confirm-upload`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function uploadDocumentFile(documentId: string, file: File): Promise<BackendDocument> {
  const uploadUrlResponse = await requestDocumentUploadUrl(
    documentId,
    file.name,
    file.type || "application/octet-stream"
  );

  const uploadResponse = await fetch(uploadUrlResponse.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!uploadResponse.ok) {
    const body = await uploadResponse.text();
    throw new Error(`Upload to S3 failed: ${uploadResponse.status}${body ? ` - ${body}` : ""}`);
  }

  return confirmDocumentUpload(documentId, {
    fileName: uploadUrlResponse.fileName,
    fileSize: file.size,
    contentType: uploadUrlResponse.contentType ?? (file.type || "application/octet-stream"),
  });
}

export async function getCommentsByDocumentId(docId: string): Promise<BackendComment[]> {
  const response = await fetch(`${API_BASE}/api/comments/list/${docId}`, { headers: authHeaders() });
  return handleResponse(response);
}

export async function createComment(payload: BackendComment): Promise<BackendComment> {
  const response = await fetch(`${API_BASE}/api/comments/add`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export function getDocumentDownloadUrl(documentId: string): string {
  return `${API_BASE}/api/documents/${documentId}/download`;
}

export async function downloadDocument(documentId: string, fileName: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/documents/${documentId}/download`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Download failed: ${response.status}${body ? ` - ${body}` : ""}`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
