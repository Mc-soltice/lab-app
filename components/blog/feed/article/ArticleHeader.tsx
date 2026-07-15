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
  return (
    <>
      {/* Navigation bar */}
      <div
        id="article-nav-header"
        className="flex items-center justify-between font-mono text-xs w-full"
      >
        <button
          id="article-back-to-feed"
          onClick={() => {
            setActiveView("feed");
          }}
          className="flex items-center gap-2 py-2 px-3 rounded-xl uppercase tracking-wider font-bold transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: "var(--accent)" }} />
          <span>Retour au flux</span>
        </button>

        <span
          className="uppercase tracking-widest"
          style={{ color: "var(--text-tertiary)" }}
        >
          {activePost.category} {"//"} {activePost.readingTime}
        </span>
      </div>

      {/* Cover image header */}
      <div
        id="article-cover-panel"
        className="relative aspect-video w-full rounded-3xl overflow-hidden border"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <ProductImage
          src={activePost.imageUrl}
          alt={activePost.title}
          fill
          sizes="(min-width: 1024px) 1152px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-black/40 to-transparent" />

        {/* Category floating tag */}
        <div className="absolute top-6 left-6">
          <span
            className="px-4 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase rounded-full shadow-[0_4px_12px_rgba(212,255,0,0.3)]"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-primary)",
            }}
          >
            {activePost.category}
          </span>
        </div>

        <div className="absolute bottom-10 left-6 right-6 md:left-12 md:right-12">
          <h1
            className="text-3xl md:text-5xl font-display font-light leading-tight tracking-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            {activePost.title}
          </h1>

          {/* Author & date metadata block */}
          <div
            className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setSelectedAuthorId(activePost.authorId);
              }}
            >
              <div
                className="relative w-12 h-12 rounded-full overflow-hidden border-2 bg-zinc-700"
                style={{ borderColor: "var(--accent)" }}
              >
                <ProductImage
                  src={activePost.authorAvatar}
                  alt={activePost.authorName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <p
                  className="text-sm font-bold transition-colors"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                >
                  {activePost.authorName}
                </p>
                <p
                  className="text-[10px] font-mono uppercase tracking-widest mt-0.5"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {activePost.authorRole}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {activePost.date}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
