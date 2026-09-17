import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  itemsPerPageOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  itemLabel = 'items',
  className = '',
}) => {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, safeCurrentPage * itemsPerPage);

  const getPageNumbers = () => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    if (safeCurrentPage > 3) pages.push('...');
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safeCurrentPage < safeTotalPages - 2) pages.push('...');
    pages.push(safeTotalPages);
    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest px-4 py-3 rounded-xl border border-surface-container-low shadow-xs font-body-sm ${className}`}
    >
      {/* Items Range & Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-secondary text-xs sm:text-sm">
        <span>
          Showing <strong className="text-on-surface font-semibold">{startItem}</strong>–
          <strong className="text-on-surface font-semibold">{endItem}</strong> of{' '}
          <strong className="text-on-surface font-semibold">{totalItems}</strong> {itemLabel}
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-surface-container-high">
            <label htmlFor="items-per-page-select" className="text-secondary text-xs">
              Per page:
            </label>
            <select
              id="items-per-page-select"
              value={itemsPerPage >= 500 ? 'ALL' : itemsPerPage}
              onChange={(e) => {
                const val = e.target.value === 'ALL' ? 500 : Number(e.target.value);
                onItemsPerPageChange(val);
                onPageChange(1);
              }}
              className="bg-surface-container-low text-on-surface font-medium px-2 py-1 rounded-lg border border-surface-container-high text-xs outline-none cursor-pointer focus:border-primary"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              <option value="ALL">All ({totalItems})</option>
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage <= 1}
          aria-label="First page"
          className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'string' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-secondary text-xs select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={safeCurrentPage === p ? 'page' : undefined}
                className={`min-w-[30px] h-[30px] rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  safeCurrentPage === p
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages}
          aria-label="Next page"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs font-semibold"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage >= safeTotalPages}
          aria-label="Last page"
          className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
