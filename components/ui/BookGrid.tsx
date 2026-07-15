// components/ui/BookGrid.tsx
"use client";

import type { BookWithRelations } from "@/lib/services/book.service";
import BookCard from "@/components/ui/BookCard";

interface BookGridProps {
  books: BookWithRelations[];
  currentUserId?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

export default function BookGrid({
  books,
  currentUserId,
  isLoading = false,
  emptyMessage = "Aucun livre disponible",
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  className = "",
}: BookGridProps) {
  // Générer les classes de colonnes
  const getGridCols = () => {
    const cols = [];
    if (columns.sm) cols.push(`grid-cols-${columns.sm}`);
    if (columns.md) cols.push(`sm:grid-cols-${columns.md}`);
    if (columns.lg) cols.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) cols.push(`xl:grid-cols-${columns.xl}`);
    return cols.join(" ");
  };

  // Afficher les skeletons
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <BookCard key={`skeleton-${index}`} isLoading />
        ))}
      </div>
    );
  }

  // Afficher le message si aucun livre
  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
        <div className="text-5xl mb-4">📚</div>
        <p className="text-lg font-medium text-neutral-300">{emptyMessage}</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
          Revenez plus tard pour découvrir de nouveaux livres
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
