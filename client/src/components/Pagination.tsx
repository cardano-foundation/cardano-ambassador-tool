import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/atoms/ArrowIcons';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  itemsPerPageStart: number;
  itemsPerPageEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  maxVisiblePages?: number;
};

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  itemsPerPageStart,
  itemsPerPageEnd,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  maxVisiblePages = 5
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxPages = Math.min(maxVisiblePages, totalPages);

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 2) {
      for (let i = 1; i <= maxPages; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 1) {
      for (let i = totalPages - maxPages + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 1; i < currentPage + maxPages - 1; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (totalPages === 0) {
    return (
      <div className="px-3 py-4 sm:px-5 sm:py-3.5 border-t border-border bg-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground order-2 sm:order-1">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-border rounded bg-card text-neutral hover:bg-rose-200 text-sm"
              >
                {pageSizeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span>per page</span>
            </div>
          )}
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <div className="text-sm text-muted-foreground">
              0 of 0
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-5 sm:py-3.5 border-t border-border bg-card">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Page Size Selector - Hidden on mobile, shown on desktop */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 border border-border rounded bg-card text-neutral hover:bg-rose-200 text-sm"
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span>per page</span>
          </div>
        )}

        {/* Mobile Layout - 2 lines only */}
        <div className="flex flex-col items-center gap-3 sm:hidden w-full">
          {/* First line: Page Size Selector */}
          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-border rounded bg-card text-neutral hover:bg-rose-200 text-sm min-w-[60px]"
              >
                {pageSizeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span>per page</span>
            </div>
          )}

          {/* Second line: Results count + Pagination controls */}
          <div className="flex items-center gap-4">
            {/* Results Count */}
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {itemsPerPageStart}-{itemsPerPageEnd} of {totalItems}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="w-4 h-4 text-neutral" />
              </button>

              <div className="flex items-center gap-1">
                {getVisiblePages().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded transition-colors text-sm ${
                      currentPage === pageNum
                        ? 'bg-muted text-neutral font-medium'
                        : 'text-foreground opacity-50 hover:opacity-75'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRightIcon className="w-4 h-4 text-neutral" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Original horizontal layout */}
        <div className="hidden sm:flex items-center gap-1">
          <div className="text-sm text-muted-foreground mr-2">
            {itemsPerPageStart}-{itemsPerPageEnd} of {totalItems}
          </div>

          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon className="w-4 h-4 text-neutral" />
          </button>

          <div className="flex items-center gap-1">
            {getVisiblePages().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded transition-colors ${
                  currentPage === pageNum
                    ? 'bg-muted text-neutral'
                    : 'text-foreground opacity-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRightIcon className="w-4 h-4 text-neutral" />
          </button>
        </div>
      </div>
    </div>
  );
}