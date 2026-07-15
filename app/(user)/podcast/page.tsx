// app/podcasts/page.tsx
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PodcastCard from "@/components/ui/PodcastCard";
import { useAuthContext } from "@/contexts/auth/auth.context";
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
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Constantes
  const LIMIT = 12;

  // Récupérer les podcasts
  const fetchPodcasts = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        if (reset) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: LIMIT.toString(),
        });

        if (searchTerm) params.append("search", searchTerm);
        if (selectedCategory) params.append("category", selectedCategory);

        const response = await fetch(`/api/podcasts?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des podcasts");
        }

        const data = await response.json();

        const newPodcasts = data.data || [];
        const totalCount = data.meta?.total || 0;

        if (reset) {
          setPodcasts(newPodcasts);
        } else {
          setPodcasts((prev) => [...prev, ...newPodcasts]);
        }

        setTotal(totalCount);
        setHasMore(pageNum * LIMIT < totalCount);
        setError(null);
      } catch (err: any) {
        console.error("Erreur fetchPodcasts:", err);
        setError(err.message || "Erreur lors du chargement des podcasts");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchTerm, selectedCategory],
  );

  // Récupérer les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok)
        throw new Error("Erreur lors du chargement des catégories");
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error("Erreur fetchCategories:", err);
    }
  }, []);

  // Charger les données initiales
  useEffect(() => {
    fetchCategories();
    fetchPodcasts(1, true);
  }, []);

  // Recharger quand la recherche ou la catégorie change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPodcasts(1, true);
  }, [searchTerm, selectedCategory]);

  // Charger plus de podcasts
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPodcasts(nextPage, false);
    }
  };

  // Gérer la lecture
  const handlePlayToggle = (podcastId: string) => {
    setCurrentPlaying(currentPlaying === podcastId ? null : podcastId);
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
        false ||
        podcast.author.lastName?.toLowerCase().includes(term) ||
        false,
    );
  }, [podcasts, searchTerm]);

  // Réinitialiser les filtres
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setShowFilters(false);
  };

  // Nombre de filtres actifs
  const activeFilterCount = (searchTerm ? 1 : 0) + (selectedCategory ? 1 : 0);

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
      <main
        className="min-h-screen"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Podcasts
                </h1>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {total > 0
                    ? `${total} podcast${total > 1 ? "s" : ""} disponibles`
                    : "Découvrez les podcasts"}
                </p>
              </div>

              <button
                onClick={() => router.push("/podcast/new")}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 flex items-center gap-2"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--text-primary)",
                }}
              >
                <Headphones className="h-4 w-4" />
                Créer un podcast
              </button>
            </div>
          </motion.div>

          {/* Barre de recherche et filtres */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--text-tertiary)" }}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un podcast..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Bouton filtres */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 rounded-xl border text-sm transition-colors flex items-center gap-2 shrink-0"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Filter className="h-4 w-4" />
                Filtres
                {activeFilterCount > 0 && (
                  <span
                    className="ml-1 px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1 shrink-0"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <X className="h-4 w-4" />
                  Effacer
                </button>
              )}
            </div>

            {/* Filtres dépliés */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-37.5">
                        <label
                          className="block text-xs font-medium mb-1.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Catégorie
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <option value="">Toutes les catégories</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <p
                className="text-sm mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {error}
              </p>
              <button
                onClick={() => fetchPodcasts(1, true)}
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
              <p
                className="text-sm mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {searchTerm || selectedCategory
                  ? "Aucun résultat ne correspond à vos critères"
                  : "Aucun podcast n'a encore été publié"}
              </p>
              {(searchTerm || selectedCategory) && (
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
                            isFollowing: false,
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
                    onClick={loadMore}
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
