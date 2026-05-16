import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  createDocument as apiCreateDocument,
  getDocuments as apiGetDocuments,
  uploadDocumentFile as apiUploadDocumentFile,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface DocFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  translatedTitle?: string;
  description: string;
  status: "draft" | "review" | "approved" | "archived";
  departmentId?: string;
  departmentName?: string;
  categoryName?: string;
  ownerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  files: DocFile[];
  comments: Comment[];
}

interface DocumentsContextType {
  documents: Document[];
  loading: boolean;
  refresh: () => Promise<void>;
  addDocument: (
    title: string,
    description: string,
    departmentId: string,
    categoryId?: string,
    categoryName?: string,
    file?: File
  ) => Promise<Document>;
  deleteDocument: (id: string) => void;
  uploadFile: (docId: string, file: File) => Promise<void>;
  removeFile: (docId: string, fileId: string) => void;
  updateStatus: (docId: string, status: Document["status"]) => void;
}

const DocumentsContext = createContext<DocumentsContextType | null>(null);

const toDocument = (apiDoc: {
  id: string;
  title: string;
  description: string;
  hasFile?: boolean;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  updatedAt?: string;
  createdAt?: string;
  translatedTitle?: string;
  departmentId?: string;
  categoryName?: string;
  ownerEmail?: string;
}): Document => {
  const file =
    apiDoc.hasFile && apiDoc.fileName
      ? [
          {
            id: `${apiDoc.id}-${apiDoc.fileName}`,
            name: apiDoc.fileName,
            size: apiDoc.fileSize ?? 0,
            type: apiDoc.contentType ?? "application/octet-stream",
            url: `/api/documents/${apiDoc.id}/download`,
            uploadedAt: new Date(apiDoc.updatedAt ?? apiDoc.createdAt ?? Date.now()),
          },
        ]
      : [];

  return {
    id: apiDoc.id,
    title: apiDoc.title,
    translatedTitle: apiDoc.translatedTitle,
    description: apiDoc.description,
    status: "draft",
    departmentId: apiDoc.departmentId,
    categoryName: apiDoc.categoryName,
    ownerEmail: apiDoc.ownerEmail,
    createdAt: new Date(apiDoc.createdAt ?? Date.now()),
    updatedAt: new Date(apiDoc.updatedAt ?? Date.now()),
    files: file,
    comments: [],
  };
};

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const apiDocs = await apiGetDocuments();
      setDocuments(apiDocs.map(toDocument));
    } catch (error) {
      console.error("Failed to load documents from backend:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDocument = useCallback(
    async (
      title: string,
      description: string,
      departmentId: string,
      categoryId?: string,
      categoryName?: string,
      file?: File
    ) => {
      let apiDoc = await apiCreateDocument({
        title,
        description,
        departmentId,
        categoryId,
        categoryName,
      });
      if (file) {
        apiDoc = await apiUploadDocumentFile(apiDoc.id, file);
      }
      const doc = toDocument(apiDoc);
      setDocuments((prev) => [doc, ...prev]);
      return doc;
    },
    []
  );

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const uploadFile = useCallback(async (docId: string, file: File) => {
    const apiDoc = await apiUploadDocumentFile(docId, file);
    const updatedDoc = toDocument(apiDoc);
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...updatedDoc, comments: doc.comments } : doc))
    );
  }, []);

  const removeFile = useCallback((docId: string, fileId: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, files: d.files.filter((f) => f.id !== fileId), updatedAt: new Date() } : d
      )
    );
  }, []);

  const updateStatus = useCallback((docId: string, status: Document["status"]) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status, updatedAt: new Date() } : d))
    );
  }, []);

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        loading,
        refresh,
        addDocument,
        deleteDocument,
        uploadFile,
        removeFile,
        updateStatus,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}
