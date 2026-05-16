import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

/**
 * PaginationController - Complete pagination component with logic
 * Handles rendering of pagination controls from pre-calculated pagination values
 * 
 * @example
 * ```tsx
 * const [page, setPage] = useState(1);
 * const pagination = usePagination(totalItems, itemsPerPage, page);
 * <PaginationController 
 *   currentPage={pagination.currentPage}
 *   totalPages={pagination.totalPages}
 *   pages={pagination.pages}
 *   onPageChange={setPage}
 * />
 * ```
 */
interface PaginationControllerProps {
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Array of page numbers and ellipsis ("...") */
  pages: (number | string)[];
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** CSS class to apply to root */
  className?: string;
}

export function PaginationController({
  currentPage,
  totalPages,
  pages,
  onPageChange,
  className,
}: PaginationControllerProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              if (canGoPrevious) {
                onPageChange(currentPage - 1);
              }
            }}
            className={!canGoPrevious ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {pages.map((page, i) =>
          page === "..." ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={`page-${page}`}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (typeof page === "number") {
                    onPageChange(page);
                  }
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              if (canGoNext) {
                onPageChange(currentPage + 1);
              }
            }}
            className={!canGoNext ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

PaginationController.displayName = "PaginationController";
