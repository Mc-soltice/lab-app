// app/podcasts/page.tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import FilterHeader, { FilterToggleGroup } from "@/components/ui/FilterHeader";
import PodcastCard from "@/components/ui/PodcastCard";
import { useAuthContext } from "@/contexts/auth/auth.context";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  audioUrl: string;
  mediaType?: "AUDIO" | "VIDEO";
  coverImage: string | null;
  duration: number;
  publishedAt: string | null;
  plays: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  status: string;
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function PodcastsPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  // États
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    items: podcasts,
    isLoading,
    isLoadingMore,
    error,
    total,
    hasMore,
    loadMore,
    reload,
  } = usePaginatedList<Podcast, { search: string; categories: string[] }>({
    pageSize: 12,
    fetchPage: async (pageNum, filters) => {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "12",
      });

      if (filters.search) params.append("search", filters.search);
      if (filters.categories.length > 0) {
        filters.categories.forEach((slug) => params.append("categories", slug));
      }

      const response = await fetch(`/api/podcasts?${params.toString()}`);
      if (!response.ok) throw new Error("Erreur lors du chargement des podcasts");

      const data = await response.json();
      return {
        items: data.data || [],
        total: data.meta?.total || 0,
      };
    },
  });

  // Récupérer les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Erreur lors du chargement des catégories");
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error("Erreur fetchCategories:", err);
    }
  }, []);

  // Charger les données initiales
  useEffect(() => {
    fetchCategories();
    reload({ search: searchTerm, categories: selectedCategories }, 1);
  }, []);

  // Recharger quand la recherche ou les catégories changent
  useEffect(() => {
    reload({ search: searchTerm, categories: selectedCategories }, 1);
  }, [searchTerm, selectedCategories]);

  // Gérer la lecture
  const handlePlayToggle = (podcastId: string) => {
    setCurrentPlaying(currentPlaying === podcastId ? null : podcastId);
  };

  // Gérer la sélection des catégories
  const handleToggleCategory = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((slug) => slug !== categorySlug)
        : [...prev, categorySlug],
    );
  };

  // Filtrer les podcasts par recherche
  const filteredPodcasts = useMemo(() => {
    if (!searchTerm.trim()) return podcasts;

    const term = searchTerm.toLowerCase().trim();
    return podcasts.filter(
      (podcast) =>
        podcast.title.toLowerCase().includes(term) ||
        podcast.description?.toLowerCase().includes(term) ||
        podcast.author.username.toLowerCase().includes(term) ||
        podcast.author.firstName?.toLowerCase().includes(term) ||
        podcast.author.lastName?.toLowerCase().includes(term),
    );
  }, [podcasts, searchTerm]);

  // Réinitialiser les filtres
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setShowFilters(false);
  };

  // Nombre de filtres actifs
  const activeFilterCount = (searchTerm ? 1 : 0) + selectedCategories.length;

  // Préparer les catégories pour FilterToggleGroup
  const categoryFilters = categories.map((cat) => ({
    id: cat.slug,
    label: cat.name,
  }));

  // Préparer les filtres actifs pour le résumé
  const activeFilters = [
    ...(searchTerm
      ? [
          {
            label: `🔍 ${searchTerm}`,
            onRemove: () => setSearchTerm(""),
          },
        ]
      : []),
    ...selectedCategories.map((categorySlug) => {
      const category = categories.find((c) => c.slug === categorySlug);
      return {
        label: category?.name || categorySlug,
        onRemove: () => handleToggleCategory(categorySlug),
      };
    }),
  ];

  // Skeleton loader
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
      {[...Array(8)].map((_, i) => (
        <PodcastCard key={i} isLoading />
      ))}
    </div>
  );

  return (
    <ProtectedRoute fallback={<div className="min-h-screen" />}>
      <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          {/* Header avec filtres */}
          <FilterHeader
            title="Podcasts"
            description={
              total > 0
                ? `${total} podcast${total > 1 ? "s" : ""} disponibles`
                : "Découvrez les podcasts"
            }
            actionLabel="Créer un podcast"
            actionIcon={<Headphones className="h-4 w-4" />}
            onAction={() => router.push("/dashboard/create?type=podcast")}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Rechercher un podcast..."
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
            activeFilters={activeFilters}
          >
            {/* Filtres avancés avec boutons cliquables */}
            {categories.length > 0 && (
              <FilterToggleGroup
                label="Catégories"
                filters={categoryFilters}
                selectedFilters={selectedCategories}
                onToggleFilter={handleToggleCategory}
              />
            )}
            {categories.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Aucune catégorie disponible
              </p>
            )}
          </FilterHeader>

          {/* Liste des podcasts */}
          {isLoading ? (
            <SkeletonLoader />
          ) : error ? (
            <div className="text-center py-16">
              <p
                className="text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                😕 Une erreur est survenue
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                {error}
              </p>
              <button
                onClick={() =>
                  reload({ search: searchTerm, categories: selectedCategories }, 1)
                }
                className="mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--text-primary)",
                }}
              >
                Réessayer
              </button>
            </div>
          ) : filteredPodcasts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Headphones
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "var(--text-tertiary)" }}
              />
              <h3
                className="text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Aucun podcast trouvé
              </h3>
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                {searchTerm || selectedCategories.length > 0
                  ? "Aucun résultat ne correspond à vos critères"
                  : "Aucun podcast n'a encore été publié"}
              </p>
              {(searchTerm || selectedCategories.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--text-primary)",
                  }}
                >
                  Effacer les filtres
                </button>
              )}
            </motion.div>
          ) : (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {filteredPodcasts.map((podcast) => (
                    <motion.div
                      key={podcast.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <PodcastCard
                        podcast={{
                          ...podcast,
                          interactionState: {
                            isLiked: false,
                            isBookmarked: false,
                          },
                        }}
                        currentUserId={user?.id}
                        isPlaying={currentPlaying === podcast.id}
                        onPlayToggle={handlePlayToggle}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Charger plus */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-10"
                >
                  <button
                    onClick={() =>
                      loadMore({
                        search: searchTerm,
                        categories: selectedCategories,
                      })
                    }
                    disabled={isLoadingMore}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Chargement...
                      </span>
                    ) : (
                      `Voir plus (${filteredPodcasts.length}/${total})`
                    )}
                  </button>
                </motion.div>
              )}

              {/* Total */}
              {!hasMore && filteredPodcasts.length > 0 && (
                <p
                  className="text-center text-sm mt-8"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {filteredPodcasts.length} podcast
                  {filteredPodcasts.length > 1 ? "s" : ""} chargé
                  {filteredPodcasts.length > 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
