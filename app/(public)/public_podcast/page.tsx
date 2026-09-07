// app/podcasts/page.tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import FeaturedPodcastHero from "@/components/ui/FeaturedPodcastHero";
import { FilterToggleGroup } from "@/components/ui/FilterHeader";
import PodcastCard from "@/components/ui/PodcastCard";
import { useAuthContext } from "@/contexts/auth/auth.context";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Headphones, Loader2, Search, X } from "lucide-react";
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
  count?: number;
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

  // Récupérer les catégories avec compteurs
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Erreur lors du chargement des catégories");
      const data = await response.json();

      const categoriesWithCount = (data.data || []).map((cat: Category) => ({
        ...cat,
        count: podcasts.filter((p) => p.category?.slug === cat.slug).length,
      }));

      setCategories(categoriesWithCount);
    } catch (err) {
      console.error("Erreur fetchCategories:", err);
    }
  }, [podcasts]);

  // Charger les données initiales
  useEffect(() => {
    fetchCategories();
    reload({ search: searchTerm, categories: selectedCategories }, 1);
  }, []);

  // Mettre à jour les compteurs quand les podcasts changent
  useEffect(() => {
    if (categories.length > 0 && podcasts.length > 0) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          count: podcasts.filter((p) => p.category?.slug === cat.slug).length,
        })),
      );
    }
  }, [podcasts]);

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
    count: cat.count || 0,
    icon: cat.count && cat.count > 0 ? "🎙️" : undefined,
  }));

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
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          {podcasts[0] && (
            <FeaturedPodcastHero
              podcast={{
                id: podcasts[0].id,
                title: podcasts[0].title,
                description: podcasts[0].description,
                coverImage: podcasts[0].coverImage,
              }}
              isPlaying={currentPlaying === podcasts[0].id}
              onPlayToggle={handlePlayToggle}
            />
          )}
          {/* Header avec dégradé ambre-rose */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-rose-600">
                  Podcasts
                </h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {total > 0
                    ? `${total} podcast${total > 1 ? "s" : ""} disponibles`
                    : "Découvrez les podcasts"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Barre de recherche et filtres avec couleurs alignées */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Recherche avec bordure ambre */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "#fbbf24" }} // amber-400
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un podcast..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-100/50 bg-white/80 backdrop-blur-sm text-gray-800 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 placeholder:text-gray-400"
                />
              </div>

              {/* Bouton filtres avec couleurs ambre-rose */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative px-4 py-2.5 rounded-xl border text-sm transition-all hover:opacity-80 active:scale-95 flex items-center gap-2 shrink-0 ${
                  showFilters
                    ? "bg-linear-to-r from-amber-100 to-rose-100 border-amber-300 text-amber-800 shadow-md"
                    : "bg-white/80 backdrop-blur-sm border-amber-100/50 text-gray-700 hover:bg-amber-50/50 hover:text-amber-700"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtres</span>
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-linear-to-r from-amber-500 to-rose-500 text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2.5 rounded-xl text-sm transition-all hover:opacity-70 active:scale-95 flex items-center gap-1 shrink-0 text-gray-400 hover:text-amber-600"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Effacer</span>
                </button>
              )}
            </div>

            {/* Filtres dépliés avec boutons à bascule */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 rounded-xl border border-amber-100/50 bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-wrap items-end gap-4">
                      {categories.length > 0 && (
                        <FilterToggleGroup
                          label="Catégories"
                          filters={categoryFilters}
                          selectedFilters={selectedCategories}
                          onToggleFilter={handleToggleCategory}
                        />
                      )}
                      {categories.length === 0 && (
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Aucune catégorie disponible
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Résumé des filtres actifs avec couleurs ambre-rose */}
            {activeFilterCount > 0 && (
              <div
                className="flex flex-wrap items-center gap-2 px-4 py-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Filtres actifs :
                </span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-linear-to-r from-amber-500/20 to-rose-500/20 text-amber-800 border border-amber-200/50">
                    🔍 {searchTerm}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:opacity-70 transition-opacity"
                      aria-label="Supprimer la recherche"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategories.map((categorySlug) => {
                  const category = categories.find((c) => c.slug === categorySlug);
                  return (
                    <span
                      key={categorySlug}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-linear-to-r from-amber-500/20 to-rose-500/20 text-amber-800 border border-amber-200/50"
                    >
                      {category?.name || categorySlug}
                      <button
                        onClick={() => handleToggleCategory(categorySlug)}
                        className="hover:opacity-70 transition-opacity"
                        aria-label={`Supprimer le filtre ${category?.name || categorySlug}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Tout effacer
                </button>
              </div>
            )}
          </motion.div>

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
                className="mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 bg-linear-to-r from-amber-500 to-rose-500 text-white"
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
                  className="mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 bg-linear-to-r from-amber-500 to-rose-500 text-white"
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

              {/* Charger plus avec couleurs ambre-rose */}
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
                    className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 hover:opacity-80 active:scale-95 bg-white/80 backdrop-blur-sm border border-amber-100/50 text-gray-700 hover:bg-amber-50/50 hover:text-amber-700"
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
