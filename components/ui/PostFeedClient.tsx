"use client";

import Card from "@/components/ui/Card";
import FilterHeader from "@/components/ui/FilterHeader";
import type { FeedItem } from "@/lib/services/feed.service";
import { PencilLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
}

export default function PostFeedClient({
  initialFeed,
  currentUserId,
  page,
  totalPages,
  total,
}: PostFeedClientProps) {
  const [feedItems, setFeedItems] = useState(initialFeed);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) return;
        const data = await response.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setFeedItems(initialFeed);
  }, [initialFeed]);

  const filteredFeed = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return feedItems.filter((item) => {
      const post = item.post;
      const matchesSearch =
        !normalizedSearch ||
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.slug.toLowerCase().includes(normalizedSearch) ||
        item.author.username.toLowerCase().includes(normalizedSearch) ||
        item.author.firstName?.toLowerCase().includes(normalizedSearch) ||
        item.author.lastName?.toLowerCase().includes(normalizedSearch) ||
        post.category?.name.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        !selectedCategory || post.category?.slug === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [feedItems, searchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setShowFilters(false);
  };

  const activeFilterCount = (searchTerm ? 1 : 0) + (selectedCategory ? 1 : 0);

  return (
    <div className="space-y-6">
      <FilterHeader
        title="Posts"
        description={
          total > 0
            ? `${total} publication${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`
            : "Découvrez les derniers posts"
        }
        actionLabel="Créer un post"
        actionHref="/post"
        actionIcon={<PencilLine className="h-4 w-4" />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher un post..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      >
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
      </FilterHeader>

      {filteredFeed.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40">
          <p className="text-neutral-400 text-lg">
            Aucun post ne correspond à votre recherche
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
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
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredFeed.map((feedItem) => (
              <Card
                key={feedItem.post.id}
                post={feedItem}
                currentUserId={currentUserId}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Link
                href={`/home?page=${Math.max(1, page - 1)}`}
                className={`px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors ${
                  page <= 1 ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                ← Précédent
              </Link>

              <span className="text-neutral-400 text-sm">
                Page {page} sur {totalPages}
              </span>

              <Link
                href={`/home?page=${Math.min(totalPages, page + 1)}`}
                className={`px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors ${
                  page >= totalPages ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                Suivant →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
