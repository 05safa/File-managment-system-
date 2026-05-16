import { useDocuments, type Document } from "@/lib/documents-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import { PaginationController } from "@/components/PaginationController";

const statusColors: Record<Document["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-accent text-accent-foreground",
  approved: "bg-primary/10 text-primary",
  archived: "bg-muted text-muted-foreground",
};

const ITEMS_PER_PAGE = 10;

interface DocumentListProps {
  documents: Document[];
  onSelect: (doc: Document) => void;
  onCreate: () => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function DocumentList({ documents, onSelect, onCreate, currentPage = 1, onPageChange }: DocumentListProps) {
  const { deleteDocument } = useDocuments();
  const { user } = useAuth();
  const pagination = usePagination(documents.length, ITEMS_PER_PAGE, currentPage);
  
  const paginatedDocs = documents.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button onClick={onCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No documents found</p>
          <p className="mt-1 text-sm">Create your first document to get started.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {paginatedDocs.map((doc) => (
            <Card key={doc.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => onSelect(doc)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {doc.translatedTitle && doc.ownerEmail === user?.email
                        ? doc.translatedTitle
                        : doc.title}
                    </h3>
                    <Badge variant="secondary" className={cn("text-xs", statusColors[doc.status])}>
                      {doc.status}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{doc.description}</p>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>{doc.files.length} file{doc.files.length !== 1 ? "s" : ""}</span>
                    <span>{doc.comments.length} comment{doc.comments.length !== 1 ? "s" : ""}</span>
                    <span>Updated {doc.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(doc.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </CardContent>
            </Card>
          ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <PaginationController
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pages={pagination.pages}
              onPageChange={onPageChange ? (page) => onPageChange(page) : () => {}}
            />
          )}
        </>
      )}
    </div>
  );
}
