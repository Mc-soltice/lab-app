// app/(user)/books/page.tsx
import BookGrid from "@/components/ui/BookGrid";
import BooksPageHeader from "@/components/ui/BooksPageHeader";
import { getSession } from "@/lib/auth/session";
import { getBooks } from "@/lib/services/book.service";
import { Suspense } from "react";

interface BooksPageProps {
  searchParams?: Promise<{ page?: string; search?: string; category?: string }>;
}

function LoadingBooks() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-80 rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

async function BooksContent({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string };
}) {
  const session = await getSession();
  const currentUserId = session?.user?.id;

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search || "";
  const category = searchParams.category || "";

  const { books, total, totalPages } = await getBooks({
    page,
    limit: 12,
    search,
    category,
    status: "PUBLISHED",
  });

  return (
    <div className="space-y-6">
      <BooksPageHeader search={search} category={category} page={page} total={total} />

      <BookGrid
        books={books}
        currentUserId={currentUserId}
        emptyMessage="Aucun livre disponible pour le moment"
      />

      {totalPages > 1 && (
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
              onClick={() => {
                const params = new URLSearchParams();
                if (search) params.set("search", search);
                if (category) params.set("category", category);
                if (page > 1) params.set("page", (page - 1).toString());
                window.history.pushState({}, "", `?${params.toString()}`);
                window.location.reload();
              }}
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
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (search) params.set("search", search);
                      if (category) params.set("category", category);
                      if (pageNum > 1) params.set("page", pageNum.toString());
                      window.history.pushState({}, "", `?${params.toString()}`);
                      window.location.reload();
                    }}
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
              onClick={() => {
                const params = new URLSearchParams();
                if (search) params.set("search", search);
                if (category) params.set("category", category);
                if (page < totalPages) params.set("page", (page + 1).toString());
                window.history.pushState({}, "", `?${params.toString()}`);
                window.location.reload();
              }}
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
      )}
    </div>
  );
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = (await searchParams) || {};

  return (
    <main
      className="container mx-auto px-4 py-8"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Suspense fallback={<LoadingBooks />}>
        <BooksContent searchParams={params} />
      </Suspense>
    </main>
  );
}
