"use client";

import ArticleCard from "@/components/ui/ArticleCard";
import FilterHeader, { FilterToggleGroup } from "@/components/ui/FilterHeader";
import Pagination from "@/components/ui/Pagination";
import type { FeedItem } from "@/lib/services/feed.service";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import OptimizedImage from "./OptimizedImage";

interface PostFeedClientProps {
  initialFeed: FeedItem[];
  currentUserId?: string;
  page: number;
  totalPages: number;
  total: number;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface FilterState {
  search: string;
  categories: string[]; // Changé de string à string[] pour la multi-sélection
}

export default function PostFeedClient({
  initialFeed,
  currentUserId,
  page,
  totalPages,
  total,
}: PostFeedClientProps) {
  const [feedItems, setFeedItems] = useState(initialFeed);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Chargement des catégories avec React Query (cache + déduplication)
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<CategoryOption[]> => {
      const response = await fetch("/api/categories");
      if (!response.ok) return [];
      const data = await response.json();
      // Ajouter un compteur pour chaque catégorie
      return (data.data || []).map((cat: CategoryOption) => ({
        ...cat,
        count: feedItems.filter((item) => item.post.category?.slug === cat.slug).length,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mise à jour du feed
  useEffect(() => {
    setFeedItems(initialFeed);
  }, [initialFeed]);

  // Filtrage optimisé avec support multi-catégories
  const filteredFeed = useMemo(() => {
    const { search, categories: selectedCategories } = filters;
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch && selectedCategories.length === 0) return feedItems;

    return feedItems.filter((item) => {
      const post = item.post;

      // Recherche par texte
      const matchesSearch =
        !normalizedSearch ||
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.slug.toLowerCase().includes(normalizedSearch) ||
        item.author.username.toLowerCase().includes(normalizedSearch) ||
        item.author.firstName?.toLowerCase().includes(normalizedSearch) ||
        item.author.lastName?.toLowerCase().includes(normalizedSearch) ||
        post.category?.name.toLowerCase().includes(normalizedSearch);

      // Filtre par catégories (multi-sélection)
      const matchesCategory =
        selectedCategories.length === 0 ||
        (post.category?.slug && selectedCategories.includes(post.category.slug));

      return matchesSearch && matchesCategory;
    });
  }, [feedItems, filters]);

  // Gestionnaires d'événements
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleToggleCategory = (categorySlug: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categorySlug)
        ? prev.categories.filter((slug) => slug !== categorySlug)
        : [...prev.categories, categorySlug],
    }));
  };

  const clearFilters = () => {
    setFilters({ search: "", categories: [] });
    setShowFilters(false);
  };

  const activeFilterCount = (filters.search ? 1 : 0) + filters.categories.length;
  const hasActiveFilters = activeFilterCount > 0;
  const latestPostItem = feedItems[0] ?? null;
  const latestPost = latestPostItem?.post;
  const latestAuthor = latestPostItem?.author;

  // Préparer les catégories pour FilterToggleGroup
  const categoryFilters = (categories || []).map((cat) => ({
    id: cat.slug,
    label: cat.name,
    count: cat.count || 0,
    icon: cat.count && cat.count > 0 ? `` : undefined,
  }));

  // Préparer les filtres actifs pour le résumé
  const activeFilters = [
    ...(filters.search
      ? [
          {
            label: `🔍 ${filters.search}`,
            onRemove: () => handleSearchChange(""),
          },
        ]
      : []),
    ...filters.categories.map((categorySlug) => {
      const category = (categories || []).find((c) => c.slug === categorySlug);
      return {
        label: category?.name || categorySlug,
        onRemove: () => handleToggleCategory(categorySlug),
      };
    }),
  ];

  return (
    <div className="min-h-screen w-full px-2 sm:px-4 lg:px-6">
      <div className="py-8 space-y-6 w-full">
        {latestPost && (
          <section className="relative overflow-hidden rounded-4xl border border-amber-100/50 bg-linear-to-br from-amber-50 via-white to-rose-50 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_40%)]" />
            <div className="relative grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
              <div className="flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="inline-flex w-fit items-center rounded-full border border-amber-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 backdrop-blur">
                    Dernier post
                  </span>
                  <Link href={`/post/${latestPost.slug}`} className="group block">
                    <h2 className="text-2xl font-semibold leading-tight text-gray-900 transition-colors group-hover:text-amber-700 sm:text-3xl">
                      {latestPost.title}
                    </h2>
                  </Link>
                  <p className="max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                    {latestPost.excerpt ||
                      (latestPost.content
                        ? latestPost.content.replace(/<[^>]*>/g, "").slice(0, 180)
                        : "Découvrez le dernier article publié dans notre blog.")}
                    {latestPost.content && latestPost.content.length > 180 ? "..." : ""}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-white/80 px-3 py-2 shadow-sm">
                    {latestAuthor?.avatar ? (
                      <OptimizedImage
                        src={latestAuthor.avatar}
                        alt={latestAuthor.username}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-amber-500 to-rose-500 text-sm font-semibold text-white">
                        {(
                          latestAuthor?.firstName?.[0] ||
                          latestAuthor?.username?.[0] ||
                          "A"
                        ).toUpperCase()}
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">
                        {latestAuthor?.firstName && latestAuthor?.lastName
                          ? `${latestAuthor.firstName} ${latestAuthor.lastName}`
                          : latestAuthor?.username || "Auteur"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {latestPost.category?.name || "Blog"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/post/${latestPost.slug}`}
                    className="rounded-full bg-linear-to-r from-amber-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                  >
                    Lire l’article
                  </Link>
                </div>
              </div>

              <div className="relative min-h-55 overflow-hidden rounded-3xl border border-amber-100/70 bg-amber-100/40">
                {latestPost.coverImage ? (
                  <OptimizedImage
                    src={latestPost.coverImage}
                    alt={latestPost.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-amber-400/70 via-orange-400/50 to-rose-500/70" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </section>
        )}

        {/* En-tête avec filtres */}
        <FilterHeader
          title="Posts"
          description={
            total > 0
              ? `${total} publication${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`
              : "Découvrez les derniers posts"
          }
          searchValue={filters.search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Rechercher un post..."
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          activeFilterCount={activeFilterCount}
          onClearFilters={clearFilters}
          activeFilters={activeFilters}
        >
          {/* Filtres avancés avec boutons à bascule */}
          {!isLoadingCategories && categories && categories.length > 0 && (
            <FilterToggleGroup
              label="Catégories"
              filters={categoryFilters}
              selectedFilters={filters.categories}
              onToggleFilter={handleToggleCategory}
            />
          )}
          {isLoadingCategories && (
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Chargement des catégories"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Chargement des catégories...
            </div>
          )}
        </FilterHeader>

        {/* Résultats */}
        {filteredFeed.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl border border-dashed"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">🔍</div>
              <p
                className="text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Aucun post ne correspond à votre recherche
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Essayez de modifier vos filtres ou de rechercher autre chose
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--text-primary)",
                  }}
                >
                  Effacer tous les filtres
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Grille des posts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
              {filteredFeed.map((feedItem) => (
                <ArticleCard
                  key={feedItem.post.id}
                  post={feedItem}
                  currentUserId={currentUserId}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                search={filters.search}
                category={filters.categories[0] || ""}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
