"use client";

import FilterHeader, { FilterToggleGroup } from "@/components/ui/FilterHeader";
import { BookOpen } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
  const [showFilters, setShowFilters] = useState(false);

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

  const handleToggleCategory = (categorySlug: string) => {
    const nextCategory = category === categorySlug ? "" : categorySlug;
    updateFilters(search, nextCategory);
  };

  const handleClearFilters = () => {
    updateFilters("", "");
    setShowFilters(false);
  };

  const activeFilterCount = category ? 1 : 0;

  // Préparer les filtres actifs pour le résumé
  const activeFilters = category
    ? [
        {
          label: `Catégorie: ${category}`,
          onRemove: () => handleToggleCategory(category),
        },
      ]
    : [];

  return (
    <FilterHeader
      title="📚 Bibliothèque"
      description={
        total > 0
          ? `${total} livre${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`
          : "Découvrez notre collection de livres numériques"
      }
      actionLabel="Publier un livre"
      actionHref="/dashboard/create?type=book"
      actionIcon={<BookOpen className="h-4 w-4" />}
      searchValue={search}
      onSearchChange={(value) => updateFilters(value, category)}
      searchPlaceholder="Rechercher un livre..."
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      activeFilterCount={activeFilterCount}
      onClearFilters={handleClearFilters}
      activeFilters={activeFilters}
    >
      {/* Filtres avancés avec boutons cliquables */}
      <FilterToggleGroup
        label="Catégorie"
        filters={[
          { id: "fiction", label: "Fiction" },
          { id: "non-fiction", label: "Non-fiction" },
          { id: "science", label: "Science" },
          { id: "technologie", label: "Technologie" },
          { id: "histoire", label: "Histoire" },
          { id: "biographie", label: "Biographie" },
        ]}
        selectedFilters={category ? [category] : []}
        onToggleFilter={handleToggleCategory}
      />
    </FilterHeader>
  );
}
