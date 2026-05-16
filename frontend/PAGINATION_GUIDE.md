# Pagination Refactoring Guide

This document explains the refactored pagination system with three levels of abstraction.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│   PaginationController (High-level)     │  ← Use this for most cases
│   Manages state + UI together           │
└────────────────────┬────────────────────┘
                     │ uses
                     ▼
┌─────────────────────────────────────────┐
│   usePagination Hook (Logic)            │  ← Use for custom UIs
│   (calculation, page management)        │
└────────────────────┬────────────────────┘
                     │ works with
                     ▼
┌─────────────────────────────────────────┐
│   Pagination UI Primitives (Low-level)  │  ← Building blocks
│   (Pagination, PaginationItem, etc.)    │
└─────────────────────────────────────────┘
```

## Usage Examples

### Option 1: Simple Usage with PaginationController (Recommended)

**Best for:** Most use cases where you just need pagination to work.

```tsx
import { useState } from "react";
import { PaginationController } from "@/components/PaginationController";

export function DocumentList() {
  const [currentPage, setCurrentPage] = useState(1);
  const documents = [...]; // 150 documents
  
  const itemsPerPage = 10;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pageData = documents.slice(startIdx, startIdx + itemsPerPage);

  return (
    <>
      {/* Render your items */}
      {pageData.map(doc => (
        <DocumentCard key={doc.id} doc={doc} />
      ))}
      
      {/* Add pagination */}
      <PaginationController
        totalItems={documents.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
```

### Option 2: Custom UI with Hook

**Best for:** Custom pagination designs or advanced layouts.

```tsx
import { useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";

export function CustomPagination() {
  const [page, setPage] = useState(1);
  const {
    currentPage,
    totalPages,
    pages,
    canGoNext,
    canGoPrevious,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination(150, 10);

  return (
    <div className="flex gap-2">
      <Button 
        onClick={previousPage} 
        disabled={!canGoPrevious}
      >
        ← Previous
      </Button>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <Button 
        onClick={nextPage} 
        disabled={!canGoNext}
      >
        Next →
      </Button>
    </div>
  );
}
```

### Option 3: Manual Control with Primitives

**Best for:** Full control over rendering and behavior.

```tsx
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export function CustomManualPagination() {
  const [current, setCurrent] = useState(1);
  const total = 10;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={() => setCurrent(p => p - 1)}
            className={current === 1 ? "opacity-50" : ""}
          />
        </PaginationItem>

        {Array.from({ length: total }, (_, i) => (
          <PaginationItem key={i + 1}>
            <PaginationLink
              href="#"
              isActive={current === i + 1}
              onClick={() => setCurrent(i + 1)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={() => setCurrent(p => p + 1)}
            className={current === total ? "opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

## Component Reference

### usePagination Hook

```tsx
const {
  currentPage,      // Current page number
  totalPages,       // Total number of pages
  startIndex,       // Start index for current page
  endIndex,         // End index for current page
  pages,            // Array of page numbers with ellipsis
  goToPage,         // fn: (page: number) => void
  previousPage,     // fn: () => void
  nextPage,         // fn: () => void
  canGoNext,        // boolean
  canGoPrevious,    // boolean
} = usePagination(totalItems, itemsPerPage);
```

### UI Components

All UI components are composable and work together:

- **Pagination** — Navigation wrapper
- **PaginationContent** — List container
- **PaginationItem** — Individual item
- **PaginationLink** — Clickable link/button
- **PaginationPrevious** — Previous button
- **PaginationNext** — Next button
- **PaginationEllipsis** — "..." indicator

### PaginationController

```tsx
<PaginationController
  totalItems={number}           // Total items to paginate
  itemsPerPage={number}         // Items per page (default: 10)
  currentPage={number}          // Current page (controlled)
  onPageChange={(page) => {}}   // Page change callback
  className={string}            // Optional CSS class
/>
```

## When to Use Each Approach

| Approach | Pros | Cons | When |
|----------|------|------|------|
| **PaginationController** | Simple, complete, handles everything | Less flexible | 90% of cases |
| **usePagination Hook** | Flexible, custom UI possible | Needs setup | Custom designs |
| **Primitives** | Full control, composable | Manual work | Advanced layouts |

## Key Improvements

✅ **Reusable logic** — `usePagination` hook handles all calculations
✅ **Composable UI** — Mix and match pagination components
✅ **Better documentation** — JSDoc comments on all components
✅ **Controlled component** — `PaginationController` accepts props
✅ **Accessibility** — Proper ARIA labels and keyboard support
✅ **Type-safe** — Full TypeScript support
