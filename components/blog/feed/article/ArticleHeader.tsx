// components/blog/article/ArticleHeader.tsx
"use client";

import ProductImage from "@/components/ProductImage";
import { ChevronLeft } from "lucide-react";
import { UIArticlePost } from "./ArticleView";

interface ArticleHeaderProps {
  activePost: UIArticlePost;
  setActiveView: (view: "feed" | "article" | "author" | "admin") => void;
  setSelectedAuthorId: (id: string | null) => void;
}

export default function ArticleHeader({
  activePost,
  setActiveView,
  setSelectedAuthorId,
}: ArticleHeaderProps) {
  const ref =
    activePost.id
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 8)
      .toUpperCase() || "000000";

  const rows: [string, string][] = [
    ["Référence", ref],
    ["Catégorie", activePost.category],
    ["Publié le", activePost.date],
    ["Lecture", activePost.readingTime],
  ];

  return (
    <div id="article-nav-header" className="flex flex-col gap-6 w-full">
      {/* Barre de navigation */}
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
        <button
          id="article-back-to-feed"
          onClick={() => setActiveView("feed")}
          className="flex items-center gap-1.5 py-1.5 pr-3 pl-1.5 rounded-full font-semibold transition-colors"
          style={{ color: "var(--ra-ink-soft)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--ra-ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--ra-ink-soft)";
          }}
        >
          <ChevronLeft className="w-3.5 h-3.5" style={{ color: "var(--ra-amber)" }} />
          Retour au registre
        </button>
        <span style={{ color: "var(--ra-ink-soft)" }}>Fiche N° {ref}</span>
      </div>

      {/* Fiche dossier */}
      <div
        className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10 p-6 md:p-10 rounded-sm border"
        style={{
          backgroundColor: "var(--ra-paper)",
          borderColor: "var(--ra-rule)",
        }}
      >
        {/* Photographie "collée" */}
        <div className="relative">
          <div
            className="relative aspect-4/5 md:aspect-3/4 w-full max-w-sm mx-auto md:mx-0 -rotate-1 p-2"
            style={{
              backgroundColor: "#FBF8EF",
              border: "1px solid var(--ra-rule-strong)",
              boxShadow: "0 10px 24px rgba(34,40,31,0.22)",
            }}
          >
            <div className="relative w-full h-full overflow-hidden">
              <ProductImage
                src={activePost.imageUrl}
                alt={activePost.title}
                fill
                sizes="(min-width: 768px) 380px, 90vw"
                className="object-cover"
                style={{ filter: "sepia(0.18) saturate(0.9) contrast(1.02)" }}
              />
            </div>
            <span
              className="absolute -top-2 left-4 w-10 h-4 -rotate-6"
              style={{ backgroundColor: "rgba(176,123,44,0.35)" }}
            />
            <span
              className="absolute -top-2 right-4 w-10 h-4 rotate-[5deg]"
              style={{ backgroundColor: "rgba(176,123,44,0.35)" }}
            />
          </div>
          <span
            className="absolute -top-3 -left-3 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest rotate-[-4deg] border-2 rounded-sm"
            style={{
              borderColor: "var(--ra-bordeaux)",
              color: "var(--ra-bordeaux)",
              backgroundColor: "rgba(244,238,223,0.92)",
            }}
          >
            {activePost.category}
          </span>
        </div>

        {/* Fiche signalétique */}
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3"
              style={{ color: "var(--ra-amber)" }}
            >
              Article du registre
            </p>
            <h1
              className="font-serif text-3xl md:text-[2.6rem] leading-[1.08] tracking-tight"
              style={{ color: "var(--ra-ink)" }}
            >
              {activePost.title}
            </h1>
          </div>

          {/* Lignes à pointillés */}
          <dl className="flex flex-col gap-2 font-mono text-[11px]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt
                  className="uppercase tracking-widest shrink-0"
                  style={{ color: "var(--ra-ink-soft)" }}
                >
                  {label}
                </dt>
                <span
                  className="flex-1 border-b border-dotted -translate-y-0.5"
                  style={{ borderColor: "var(--ra-rule-strong)" }}
                />
                <dd className="shrink-0" style={{ color: "var(--ra-ink)" }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Auteur */}
          <div
            className="flex items-center gap-3 pt-5 border-t cursor-pointer group"
            style={{ borderColor: "var(--ra-rule)" }}
            onClick={() => setSelectedAuthorId(activePost.authorId)}
          >
            <div
              className="relative w-11 h-11 overflow-hidden border shrink-0"
              style={{ borderColor: "var(--ra-green)" }}
            >
              <ProductImage
                src={activePost.authorAvatar}
                alt={activePost.authorName}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div>
              <p
                className="text-sm font-serif font-semibold"
                style={{ color: "var(--ra-ink)" }}
              >
                {activePost.authorName}
              </p>
              <p
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: "var(--ra-ink-soft)" }}
              >
                {activePost.authorRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
