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
      <BooksPageHeader
        search={search}
        category={category}
        page={page}
        total={total}
      />

      <BookGrid
        books={books}
        currentUserId={currentUserId}
        emptyMessage="Aucun livre disponible pour le moment"
      />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
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
            className="px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            ← Précédent
          </button>

          <span className="text-neutral-400 text-sm">
            Page {page} sur {totalPages}
          </span>

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
            className="px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            Suivant →
          </button>
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
