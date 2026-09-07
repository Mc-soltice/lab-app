// app/post/enregistrement/page.tsx
"use client";

import ArticleCard from "@/components/ui/ArticleCard";
import { useSavedPosts } from "@/hooks/blog/post/useSavedPosts";
import { motion } from "framer-motion";
import { useState } from "react";

const ACCENT = "#A5A0E8"; // périwinkle
const ACCENT_WARM = "#FFBE98"; // peach fuzz

export default function SavedPostsPage() {
  const { posts, isLoading, hasMore, loadMore, refresh, total } = useSavedPosts(
    {
      limit: 10,
      onError: (error) => console.error(error),
    },
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ArticleCard key={i} isLoading />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* En-tête — ruban de bibliothèque */}
      <div className="relative mb-10 flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-[#A5A0E8]/70 font-['DM_Sans'] mb-2">
            Bibliothèque personnelle
          </p>
          <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] italic text-white">
            Vos lectures enregistrées
          </h1>
        </div>

        {/* Étiquette de comptage — le signature element */}
        <div className="relative shrink-0">
          <div
            className="relative flex flex-col items-center justify-center px-5 py-3 rounded-lg backdrop-blur-md border shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(165,160,232,0.15), rgba(255,190,152,0.10))",
              borderColor: "rgba(165,160,232,0.3)",
            }}
          >
            <span className="text-2xl font-['Playfair_Display'] text-white leading-none">
              {total}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-['DM_Sans'] mt-1">
              {total > 1 ? "articles" : "article"}
            </span>
          </div>
          {/* petite encoche façon marque-page */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "8px solid rgba(165,160,232,0.3)",
            }}
          />
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/15 py-16 px-6 text-center backdrop-blur-sm bg-white/2">
          <div
            className="mx-auto mb-5 h-14 w-10 rounded-sm"
            style={{
              background:
                "linear-gradient(160deg, rgba(165,160,232,0.5), rgba(255,190,152,0.4))",
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
            }}
          />
          <p className="text-white text-lg font-['Playfair_Display'] italic mb-2">
            Votre pile de lecture est vide
          </p>
          <p className="text-neutral-400 text-sm font-['DM_Sans'] max-w-sm mx-auto">
            Parcourez le feed et enregistrez les articles qui méritent d'être
            relus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((item, index) => (
            <motion.div
              key={item.post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
            >
              <ArticleCard post={item} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Bouton "Charger plus" */}
      {hasMore && posts.length > 0 && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 rounded-full font-['DM_Sans'] text-sm font-medium text-white border transition-all hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, rgba(165,160,232,0.15), rgba(255,190,152,0.10))",
              borderColor: "rgba(165,160,232,0.3)",
            }}
          >
            Charger plus d'articles
          </button>
        </div>
      )}

      {/* Bouton rafraîchir */}
      <button
        onClick={handleRefresh}
        aria-label="Rafraîchir"
        className="fixed bottom-6 right-6 p-3 rounded-full backdrop-blur-md border shadow-lg transition-transform hover:scale-105"
        style={{
          background:
            "linear-gradient(135deg, rgba(165,160,232,0.2), rgba(255,190,152,0.15))",
          borderColor: "rgba(165,160,232,0.35)",
        }}
      >
        <motion.svg
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </motion.svg>
      </button>
    </div>
  );
}
