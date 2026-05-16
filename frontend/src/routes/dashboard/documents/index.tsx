import { useState } from "react";
import { useDocuments, type Document } from "@/lib/documents-context";
import { DocumentList } from "@/components/DocumentList";
import { CreateDocumentForm } from "@/components/CreateDocumentForm";
import { DocumentDetail } from "@/components/DocumentDetail";
import { DocumentSearchBar } from "@/components/DocumentSearchBar";
import { useDocumentSearch, SearchFilters } from "@/hooks/useDocumentSearch";

function DocumentsPage() {
  const { documents } = useDocuments();
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: "",
  });

  const filteredDocuments = useDocumentSearch(documents, filters);
  const selectedDoc = filteredDocuments.find((d) => d.id === selectedDocId);

  if (view === "create") {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">New Document</h1>
        <CreateDocumentForm
          onCreated={() => setView("list")}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  if (view === "detail" && selectedDoc) {
    return (
      <div className="p-6 lg:p-8">
        <DocumentDetail
          document={selectedDoc}
          onBack={() => {
            setView("list");
            setSelectedDocId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Documents</h1>
      <div className="mb-6">
        <DocumentSearchBar filters={filters} onFiltersChange={setFilters} />
      </div>
      <DocumentList
        documents={filteredDocuments}
        onSelect={(doc: Document) => {
          setSelectedDocId(doc.id);
          setView("detail");
        }}
        onCreate={() => setView("create")}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default DocumentsPage;
