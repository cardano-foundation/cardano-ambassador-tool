import { useState, useMemo, useEffect, useRef } from 'react';
import { SortUpIcon, SortDownIcon } from '@/components/atoms/SortIcons';
import { CopyIcon } from '@/components/atoms/CopyIcon';
import Button from '@/components/atoms/Button';
import { Pagination } from '@/components/Pagination';

type ColumnDef<T> = {
  header: string;
  accessor: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
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
};

export function Table<T>({
  data,
  columns,
  pageSize: initialPageSize = 10,
  onPageSizeChange,
  searchable = false,
  searchPlaceholder = "Search...",
  className = '',
  onCopy,
  autoSize = true
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [copiedCell, setCopiedCell] = useState<{ row: number; column: string } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const pageSize = onPageSizeChange ? initialPageSize : internalPageSize;

  const copyToClipboard = async (text: string, rowIndex: number, columnHeader: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCell({ row: rowIndex, column: columnHeader });

      onCopy?.(text, columnHeader);

      setTimeout(() => {
        setCopiedCell(null);
      }, 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedCell({ row: rowIndex, column: columnHeader });
        onCopy?.(text, columnHeader);
        setTimeout(() => {
          setCopiedCell(null);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy text:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;

    if (text.length > 40) {
      const start = text.slice(0, 8);
      const end = text.slice(-6);
      return `${start}...${end}`;
    }

    return text.slice(0, maxLength - 3) + '...';
  };

  const isLikelyAddress = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return value.length > 40 && /^[a-zA-Z0-9]+$/.test(value);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.accessor];
        return value?.toString().toLowerCase().includes(searchLower);
      })
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
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
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

  const getCellContent = (column: ColumnDef<T>, row: T, rowIndex: number) => {
    const value = row[column.accessor];

    const shouldTruncate = column.truncate || (autoSize && isLikelyAddress(value));

    let displayContent: React.ReactNode;
    if (column.cell) {
      displayContent = column.cell(value, row);
    } else {
      let displayValue = String(value);
      if (shouldTruncate && typeof value === 'string') {
        const maxLength = typeof column.truncate === 'number' ? column.truncate : 20;
        displayValue = truncateText(value, maxLength);
      }
      displayContent = displayValue;
    }

    if (column.copyable) {
      let copyText: string;
      if (column.getCopyText) {
        copyText = column.getCopyText(value, row);
      } else {
        copyText = String(value);
      }

      const isCopied = copiedCell?.row === rowIndex && copiedCell?.column === column.header;

      return (
        <div className="flex items-center gap-2">
          <span className="flex-1" title={shouldTruncate ? String(value) : undefined}>
            {displayContent}
          </span>
          <Button
            variant='ghost'
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(copyText, rowIndex, column.header);
            }}
            className={`p-1 transition-all border-none flex-shrink-0 ${
              isCopied
                ? 'opacity-50'
                : 'opacity-70 hover:opacity-100'
            }`}
            title={isCopied ? 'Copied!' : `Copy ${column.header}`}
          >
            {isCopied ? (
              <span></span>
            ) : (
              <CopyIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </Button>
        </div>
      );
    }

    if (shouldTruncate && typeof value === 'string') {
      const maxLength = typeof column.truncate === 'number' ? column.truncate : 20;
      const truncatedValue = truncateText(value, maxLength);
      return (
        <span title={value}>
          {truncatedValue}
        </span>
      );
    }

    return displayContent;
  };

  const getColumnClass = (column: ColumnDef<T>) => {
    return '';
  };

  const itemsPerPageStart = paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const itemsPerPageEnd = Math.min(currentPage * pageSize, sortedData.length);

  return (
    <div className={`${className}`}>
      <div className="border border-border rounded-lg overflow-hidden">

        <div className="px-6 py-4 bg-background">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} of {sortedData.length} {data.length > 1 ? 'items' : 'item'}
            </div>
            {searchable && (
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white pl-10 pr-4 py-2 w-64 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            ref={tableRef}
            className="w-full text-sm text-left text-foreground"
            style={{ tableLayout: autoSize ? 'auto' : 'fixed' }}
          >
            <thead className="text-sm font-normal bg-neutral-50 dark:bg-muted text-neutral">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className={`px-6 py-3 font-normal border border-border last:border-r-0 whitespace-nowrap ${
                      column.sortable ? 'cursor-pointer select-none' : ''
                    } ${getColumnClass(column)}`}
                    onClick={() => column.sortable && requestSort(column.accessor)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <div className="flex flex-col items-center gap-0.5 ml-1">
                          <SortUpIcon className={
                            sortConfig?.key === column.accessor && sortConfig.direction === 'ascending'
                              ? 'text-neutral'
                              : 'text-muted-foreground'
                          } />
                          <SortDownIcon className={
                            sortConfig?.key === column.accessor && sortConfig.direction === 'descending'
                              ? 'text-neutral'
                              : 'text-muted-foreground'
                          } />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="bg-card hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.header}
                        className="px-6 py-4 border-r border-border last:border-r-0"
                      >
                        {getCellContent(column, row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr className="bg-card">
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                    {searchTerm ? `No results found for "${searchTerm}"` : 'No data found'}
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