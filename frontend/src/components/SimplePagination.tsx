import { useState } from "react";
import { PaginationController } from "@/components/PaginationController";

/**
 * SimplePagination - Self-contained pagination component
 * Manages its own state internally - no need to manage page state externally
 * 
 * @example
 * ```tsx
 * <SimplePagination
 *   totalItems={150}
 *   itemsPerPage={10}
 *   onPageChange={(page, startIdx, endIdx) => {
 *     const pageData = data.slice(startIdx, endIdx);
 *     setCurrentData(pageData);
 *   }}
 * />
 * ```
 */
interface SimplePaginationProps {
  /** Total number of items to paginate */
  totalItems: number;
  /** Number of items per page */
  itemsPerPage?: number;
  /** Callback when page changes - receives page number and index range */
  onPageChange?: (page: number, startIndex: number, endIndex: number) => void;
  /** CSS class to apply to root */
  className?: string;
}

export function SimplePagination({
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className,
}: SimplePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
    if (onPageChange) {
      const startIdx = (newPage - 1) * itemsPerPage;
      const endIdx = Math.min(startIdx + itemsPerPage, totalItems);
      onPageChange(newPage, startIdx, endIdx);
    }
  };

  return (
    <PaginationController
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      className={className}
    />
  );
}

SimplePagination.displayName = "SimplePagination";
