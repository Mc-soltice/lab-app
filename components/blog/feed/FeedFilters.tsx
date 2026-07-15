// components/blog/feed/FeedFilters.tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import SearchBar from "./SearchBar";

interface FeedFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  categories: any[]; // Garder le type mais s'assurer que c'est un tableau
  activeFeedFormat: "all" | "article" | "multimedia";
  setActiveFeedFormat: (format: "all" | "article" | "multimedia") => void;
  counts: { all: number; article: number; multimedia: number };
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [], // Valeur par défaut
  activeFeedFormat,
  setActiveFeedFormat,
  counts,
}) => {
  const tabs = [
    { id: "all", label: "Tout le Flux", count: counts.all },
    { id: "article", label: "📰 Articles", count: counts.article },
    { id: "multimedia", label: "🎙️ Médias", count: counts.multimedia },
  ] as const;

  // S'assurer que categories est un tableau
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs avec layoutId */}
      <div
        className="relative w-full flex p-1 rounded-2xl border backdrop-blur-sm"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeFeedFormat === tab.id;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setActiveFeedFormat(tab.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl 
                text-xs font-mono font-medium transition-colors
                ${isActive ? "" : "hover:opacity-80"}
              `}
              style={{
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl border shadow-[0_0_30px_rgba(201,155,130,0.24)]"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--accent)",
                  }}
                />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                {tab.label}
              </span>
              <motion.span
                className="relative z-10 text-[10px] px-2 py-0.5 rounded"
                animate={{
                  backgroundColor: isActive
                    ? "var(--bg-tertiary)"
                    : "var(--bg-tertiary)",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                }}
                transition={{ duration: 0.3 }}
              >
                {tab.count}
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* Section SearchBar avec animation */}
      <motion.div
        className="rounded-2xl p-4 border backdrop-blur-sm"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeedFormat}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categories={safeCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Résultats de recherche */}
      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="text-xs px-2 py-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Résultats pour :{" "}
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                &quot;{searchQuery}&quot;
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
