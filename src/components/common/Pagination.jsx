import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-border-strong px-4 py-3 sm:px-6 bg-surface-container-lowest/50 rounded-b-2xl">
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-xl border border-border-strong bg-surface px-4 py-2 text-xs font-bold text-secondary hover:text-on-surface transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          Previous
        </button>
        <div className="flex items-center text-xs text-secondary font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-xl border border-border-strong bg-surface px-4 py-2 text-xs font-bold text-secondary hover:text-on-surface transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
        <div>
          <p className="text-xs text-secondary font-medium">
            Showing page <span className="font-bold text-on-surface">{currentPage}</span> of{' '}
            <span className="font-bold text-on-surface">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl gap-1" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl p-2 text-secondary hover:text-on-surface hover:bg-white/5 border border-border-strong disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft size={16} />
            </button>

            {startPage > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className={`relative inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                    currentPage === 1
                      ? 'bg-primary-container border-primary-container text-on-primary-container'
                      : 'border-border-strong text-secondary hover:bg-white/5 hover:text-on-surface'
                  }`}
                >
                  1
                </button>
                {startPage > 2 && <span className="px-1.5 py-2 text-xs text-secondary">...</span>}
              </>
            )}

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-primary-container border-primary-container text-on-primary-container'
                    : 'border-border-strong text-secondary hover:bg-white/5 hover:text-on-surface'
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="px-1.5 py-2 text-xs text-secondary">...</span>}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`relative inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                    currentPage === totalPages
                      ? 'bg-primary-container border-primary-container text-on-primary-container'
                      : 'border-border-strong text-secondary hover:bg-white/5 hover:text-on-surface'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-xl p-2 text-secondary hover:text-on-surface hover:bg-white/5 border border-border-strong disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
