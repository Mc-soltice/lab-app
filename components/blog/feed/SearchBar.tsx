// components/blog/feed/SearchBar.tsx
"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categories: any[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  categories = [], // Valeur par défaut
  selectedCategory,
  setSelectedCategory,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  // S'assurer que categories est un tableau
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="flex flex-col gap-3">
      {/* Barre de recherche */}
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
          isFocused ? "ring-2 ring-(--accent)" : ""
        }`}
        style={{
          backgroundColor: "var(--bg-tertiary)",
          borderColor: isFocused ? "var(--accent)" : "var(--border)",
        }}
      >
        <Search
          className="w-4 h-4 shrink-0"
          style={{ color: "var(--text-tertiary)" }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Rechercher un article, un auteur..."
          className="w-full bg-transparent border-none outline-none text-sm placeholder:text-sm"
          style={{
            color: "var(--text-primary)",
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="p-1 rounded-full transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtres catégories */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedCategory === "all" ? "border shadow-sm" : "hover:opacity-70"
          }`}
          style={{
            backgroundColor:
              selectedCategory === "all"
                ? "var(--accent)"
                : "var(--bg-tertiary)",
            color:
              selectedCategory === "all"
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            borderColor:
              selectedCategory === "all" ? "var(--accent)" : "var(--border)",
          }}
        >
          Tous les articles
        </button>
        {safeCategories.map((cat: any) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.slug || cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === (cat.slug || cat.id)
                ? "border shadow-sm"
                : "hover:opacity-70"
            }`}
            style={{
              backgroundColor:
                selectedCategory === (cat.slug || cat.id)
                  ? "var(--accent)"
                  : "var(--bg-tertiary)",
              color:
                selectedCategory === (cat.slug || cat.id)
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              borderColor:
                selectedCategory === (cat.slug || cat.id)
                  ? "var(--accent)"
                  : "var(--border)",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
