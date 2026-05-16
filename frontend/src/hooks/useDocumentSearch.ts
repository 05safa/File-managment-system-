import { useMemo } from "react";
import { Document } from "@/lib/documents-context";

export interface SearchFilters {
  searchQuery: string;
  status?: Document["status"];
  dateFrom?: Date;
  dateTo?: Date;
  minFiles?: number;
  maxFiles?: number;
  hasComments?: boolean;
}

/**
 * Hook to filter documents based on search and filter criteria
 */
export const useDocumentSearch = (documents: Document[], filters: SearchFilters) => {
  return useMemo(() => {
    return documents.filter((doc) => {
      // Search query filter (title and description)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && doc.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && doc.createdAt < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && doc.createdAt > filters.dateTo) {
        return false;
      }

      // File count filter
      const fileCount = doc.files.length;
      if (filters.minFiles !== undefined && fileCount < filters.minFiles) {
        return false;
      }
      if (filters.maxFiles !== undefined && fileCount > filters.maxFiles) {
        return false;
      }

      // Comments filter
      if (filters.hasComments !== undefined) {
        const hasComments = doc.comments.length > 0;
        if (filters.hasComments !== hasComments) {
          return false;
        }
      }

      return true;
    });
  }, [documents, filters]);
};
