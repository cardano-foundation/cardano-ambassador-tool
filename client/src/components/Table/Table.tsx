import { SortDownIcon, SortUpIcon } from '@/components/atoms/SortIcons';
import { Pagination } from '@/components/Pagination';
import { useMemo, useRef, useState } from 'react';

type ColumnDef<T> = {
  header: string;
  accessor?: keyof T;
  cell: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  copyable?: boolean;
  getCopyText?: (value: any, row: T) => string;
  truncate?: boolean | number;
};

type TableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  onPageSizeChange?: (newPageSize: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  onCopy?: (text: string, column: string) => void;
  autoSize?: boolean;
  context?: string;
};

export function Table<T>({
  data,
  columns,
  pageSize: initialPageSize = 10,
  onPageSizeChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
  autoSize = true,
  context,
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);

  const pageSize = onPageSizeChange ? initialPageSize : internalPageSize;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((column) => {
        const value = column.accessor ? row[column.accessor] : null;
        return value?.toString().toLowerCase().includes(searchLower);
      }),
    );
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const requestSort = (key: keyof T) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPage(1);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      setInternalPageSize(newPageSize);
    }
  };

  const itemsPerPageStart =
    paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const itemsPerPageEnd = Math.min(currentPage * pageSize, sortedData.length);

  return (
    <div className={`${className}`}>
      <div className="border-border overflow-hidden rounded-lg border">
        <div className="bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Showing{' '}
              {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{' '}
              of {sortedData.length} {context ?? 'items'}
            </div>
            {searchable && (
              <div className="relative">
                <svg
                  className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-border text-foreground placeholder:text-muted-foreground focus:ring-ring w-64 rounded-lg border bg-white py-2 pr-4 pl-10 transition-colors focus:border-transparent focus:ring-2"
                />
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            ref={tableRef}
            className="text-foreground w-full text-left text-sm"
            style={{ tableLayout: autoSize ? 'auto' : 'fixed' }}
          >
            <thead className="dark:bg-muted text-neutral bg-neutral-50 text-sm font-normal">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className={`border-border border px-6 py-3 font-normal whitespace-nowrap last:border-r-0 ${
                      column.sortable ? 'cursor-pointer select-none' : ''
                    } }`}
                    onClick={() =>
                      column.sortable &&
                      column.accessor &&
                      requestSort(column.accessor)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <div className="ml-1 flex flex-col items-center gap-0.5">
                          <SortUpIcon
                            className={
                              sortConfig?.key === column.accessor &&
                              sortConfig?.direction === 'ascending'
                                ? 'text-neutral'
                                : 'text-muted-foreground'
                            }
                          />
                          <SortDownIcon
                            className={
                              sortConfig?.key === column.accessor &&
                              sortConfig?.direction === 'descending'
                                ? 'text-neutral'
                                : 'text-muted-foreground'
                            }
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="bg-card hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.header}
                        className="border-border border-r px-6 py-4 last:border-r-0"
                      >
                        {column?.cell(
                          column?.accessor ? row[column?.accessor] : '',
                          row,
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr className="bg-card">
                  <td
                    colSpan={columns.length}
                    className="text-muted-foreground px-6 py-8 text-center"
                  >
                    {searchTerm
                      ? `No results found for "${searchTerm}"`
                      : 'No data found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sortedData.length}
          itemsPerPageStart={itemsPerPageStart}
          itemsPerPageEnd={itemsPerPageEnd}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector={true}
        />
      </div>
    </div>
  );
}

export type { ColumnDef };
