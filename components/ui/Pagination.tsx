"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  search?: string;
  category?: string;
}

export default function Pagination({
  page,
  totalPages,
  search = "",
  category = "",
}: PaginationProps) {
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (newPage > 1) params.set("page", newPage.toString());
    window.history.pushState({}, "", `?${params.toString()}`);
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8 sm:flex-row sm:justify-center">
      {/* Indicateur de progression */}
      <div className="flex items-center gap-3 text-sm text-neutral-500 order-2 sm:order-1">
        <span className="font-medium text-neutral-700">{page}</span>
        <span className="w-12 h-0.5 bg-neutral-200 rounded-full relative">
          <span
            className="absolute left-0 top-0 h-full bg-linear-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-300"
            style={{ width: `${(page / totalPages) * 100}%` }}
          />
        </span>
        <span className="font-medium text-neutral-700">{totalPages}</span>
      </div>

      {/* Boutons de navigation */}
      <div className="flex items-center gap-3 order-1 sm:order-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-neutral-200 disabled:hover:shadow-none"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 disabled:group-hover:translate-x-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Numéros de pages (version desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            if (pageNum < 1 || pageNum > totalPages) return null;

            const isActive = pageNum === page;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/25"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-neutral-200 disabled:hover:shadow-none"
        >
          <span className="hidden sm:inline">Suivant</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5 disabled:group-hover:translate-x-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Compteur de pages (version mobile) */}
      <span className="text-sm text-neutral-500 order-3 sm:hidden">
        Page {page} sur {totalPages}
      </span>
    </div>
  );
}
