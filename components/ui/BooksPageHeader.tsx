"use client";

import FilterHeader from "@/components/ui/FilterHeader";
import { BookOpen } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface BooksPageHeaderProps {
  search: string;
  category: string;
  page: number;
  total: number;
}

export default function BooksPageHeader({
  search,
  category,
  page,
  total,
}: BooksPageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const updateFilters = (nextSearch: string, nextCategory: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.delete("search");
    params.delete("category");
    params.delete("page");

    if (nextSearch) {
      params.set("search", nextSearch);
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <FilterHeader
      title="📚 Bibliothèque"
      description={
        total > 0
          ? `${total} livre${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`
          : "Découvrez notre collection de livres numériques"
      }
      actionLabel="Publier un livre"
      actionHref="/book/new"
      actionIcon={<BookOpen className="h-4 w-4" />}
      searchValue={search}
      onSearchChange={(value) => updateFilters(value, category)}
      searchPlaceholder="Rechercher un livre..."
      activeFilterCount={category ? 1 : 0}
    >
      <div className="flex-1 min-w-37.5">
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Catégorie
        </label>
        <select
          value={category}
          onChange={(e) => updateFilters(search, e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Toutes les catégories</option>
          {/* Les catégories seront chargées dynamiquement */}
        </select>
      </div>
    </FilterHeader>
  );
}
