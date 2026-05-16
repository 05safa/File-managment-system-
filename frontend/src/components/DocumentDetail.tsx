import { useState, useRef, useEffect, type FormEvent } from "react";
import { useDocuments, type Document } from "@/lib/documents-context";
import { useAuth } from "@/lib/auth-context";
import { getCommentsByDocumentId, createComment, downloadDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<Document["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-accent text-accent-foreground",
  approved: "bg-primary/10 text-primary",
  archived: "bg-muted text-muted-foreground",
};

const statuses: Document["status"][] = ["draft", "review", "approved", "archived"];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

interface DocumentDetailProps {
  document: Document;
  onBack: () => void;
}

export function DocumentDetail({ document: doc, onBack }: DocumentDetailProps) {
  const { uploadFile, removeFile, updateStatus, deleteDocument } = useDocuments();
  const { user, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ id: string; author: string; content: string; timestamp: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadComments = async () => {
    setLoadingComments(true);
    try {
      const backendComments = await getCommentsByDocumentId(doc.id);
      setComments(backendComments.map((comment) => ({
        id: comment.id ?? `${doc.id}-${Date.now()}`,
        author: comment.author,
        content: comment.content,
        timestamp: comment.timestamp ?? new Date().toISOString(),
      })));
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("Unable to load comments.");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    reloadComments();
  }, [doc.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        await uploadFile(doc.id, file);
      }
    } catch (err) {
      console.error("File upload failed:", err);
      setError("Unable to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsPostingComment(true);
    setError(null);

    try {
      await createComment({
        docId: doc.id,
        author: user?.email ?? "Anonymous",
        content: commentText.trim(),
      });
      setCommentText("");
      await reloadComments();
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Unable to post comment.");
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to documents
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{doc.title}</h2>
          {doc.translatedTitle && doc.ownerEmail === user?.email && (
            <p className="mt-1 text-sm font-medium text-primary">Translated: {doc.translatedTitle}</p>
          )}
          {doc.categoryName && (
            <p className="mt-1 text-xs text-muted-foreground">Category: {doc.categoryName}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn("text-xs", statusColors[doc.status])}>{doc.status}</Badge>
          {isAdmin && (
            <>
              <select
                value={doc.status}
                onChange={(e) => updateStatus(doc.id, e.target.value as Document["status"])}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button variant="destructive" size="sm" onClick={() => { deleteDocument(doc.id); onBack(); }}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Files ({doc.files.length})</CardTitle>
          <div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {doc.files.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {doc.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} · {file.uploadedAt.toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await downloadDocument(doc.id, file.name);
                        } catch {
                          setError("Download failed. Check you are logged in.");
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(doc.id, file.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingComments ? (
            <p className="py-2 text-center text-sm text-muted-foreground">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted-foreground">No comments yet.</p>
          ) : null}
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{comment.author}</span>
                <span className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm text-foreground">{comment.content}</p>
            </div>
          ))}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isPostingComment}>
              {isPostingComment ? "Posting…" : "Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
