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
  maxVisiblePages = 5,
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
      <div className="border-border bg-card border-t px-5 py-3.5">
        <div className="flex items-center justify-between">
          {showPageSizeSelector && onPageSizeChange && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border-border bg-card text-neutral rounded border px-2 py-1 hover:bg-rose-200"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="text-muted-foreground m-2 text-sm">0 of 0</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card border-t px-5 py-3.5">
      <div className="flex items-center justify-between">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border-border bg-card text-neutral rounded border px-2 py-1 hover:bg-rose-200"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <div className="text-muted-foreground m-2 text-sm">
            {itemsPerPageStart}-{itemsPerPageEnd} of {totalItems}
          </div>

          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="hover:bg-muted rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeftIcon className="text-neutral h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {getVisiblePages().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 rounded transition-colors ${
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
            className="hover:bg-muted rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowRightIcon className="text-neutral h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
