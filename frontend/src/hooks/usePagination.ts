import { useMemo } from "react";

/**
 * Hook to manage pagination state and logic
 * Works with both controlled (via currentPage prop) and uncontrolled modes
 * 
 * @param totalItems - Total number of items
 * @param itemsPerPage - Items to display per page
 * @param currentPage - (Optional) Current page for controlled mode
 * @returns Pagination state and handlers
 */
export const usePagination = (
  totalItems: number,
  itemsPerPage: number = 10,
  currentPage?: number
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Use passed currentPage if provided (controlled), otherwise use default
  const page = currentPage ?? 1;
  
  // Ensure page is within valid range
  const validPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Memoized pages array
  const pages = useMemo(() => {
    const delta = 2; // Show 2 pages before/after current
    const result: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const isCurrent = i === validPage;
      const isNearCurrent = i >= validPage - delta && i <= validPage + delta;
      const isFirstOrLast = i === 1 || i === totalPages;
      
      if (isFirstOrLast || isCurrent || isNearCurrent) {
        result.push(i);
      } else if (result[result.length - 1] !== "...") {
        result.push("...");
      }
    }

    return result;
  }, [validPage, totalPages]);

  return {
    currentPage: validPage,
    totalPages,
    startIndex,
    endIndex,
    pages,
    canGoNext: validPage < totalPages,
    canGoPrevious: validPage > 1,
  };
};
