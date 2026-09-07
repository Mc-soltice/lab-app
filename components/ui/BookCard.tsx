// components/ui/BookCard.tsx
"use client";

import { useInteractions } from "@/hooks/useInteractions";
import type { BookWithRelations } from "@/lib/services/book.service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bookmark,
  Download,
  FileText,
  Heart,
  MessageCircle,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import OptimizedImage from "./OptimizedImage";

interface BookCardProps {
  book?: BookWithRelations;
  isLoading?: boolean;
  currentUserId?: string;
}

export default function BookCard({
  book,
  isLoading = false,
  currentUserId,
}: BookCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Version skeleton (chargement) avec shimmer
  if (isLoading) {
    return (
      <section className="relative h-full rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] flex flex-col overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-neutral-700/60" />
            <div className="h-3 w-14 rounded-full bg-neutral-700/60" />
            <div className="h-2 w-2 rounded-full bg-neutral-700/60" />
          </div>
          <div className="h-6 w-16 rounded-full bg-neutral-700/60" />
        </div>
        <div className="w-full aspect-3/4 bg-neutral-800/60" />
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="h-5 w-10 rounded-full bg-neutral-700/60" />
              <div className="h-5 w-10 rounded-full bg-neutral-700/60" />
            </div>
            <div className="h-5 w-5 rounded-full bg-neutral-700/60" />
          </div>
          <div className="h-4 w-3/4 rounded-full bg-neutral-700/60" />
        </div>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="h-full rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] min-h-75 flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Aucun livre à afficher</p>
      </section>
    );
  }

  const { author, interactionState, category, tags } = book;
  const publishedDate = book.publishedAt
    ? format(new Date(book.publishedAt), "dd MMMM yyyy", { locale: fr })
    : "Date non disponible";

  const isFree = !book.price || book.price <= 0;

  const {
    isLiked,
    isBookmarked,
    likesCount,
    isLiking,
    isBookmarking,
    toggleLike,
    toggleBookmark,
  } = useInteractions({
    targetId: book.id,
    targetType: "book",
    authorId: author.id,
    currentUserId,
    initialLiked: interactionState?.isLiked || false,
    initialBookmarked: interactionState?.isBookmarked || false,
    initialLikesCount: book.likesCount || 0,
  });

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (book.price && book.price > 0) {
      toast.error(
        "Ce livre est payant. Veuillez l'acheter pour le télécharger.",
      );
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/books/${book.id}/download`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du téléchargement");
      }

      const data = await response.json();

      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
        toast.success("Téléchargement commencé !");
      }
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du téléchargement",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="group/card h-full flex flex-col rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] hover:border-neutral-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 overflow-hidden">
      {/* Header - informations de l'auteur */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 bg-white/2 backdrop-blur-sm p-4">
        <Link
          href={`/@${author.username}`}
          className="flex flex-wrap items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
        >
          {author.avatar ? (
            <OptimizedImage
              src={author.avatar}
              alt={`${author.firstName || author.username} avatar`}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-white/10"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 ring-1 ring-white/10">
              <span className="text-white text-sm font-medium">
                {(author.firstName?.[0] || author.username[0]).toUpperCase()}
              </span>
            </div>
          )}

          <span className="text-white font-medium text-sm truncate max-w-24">
            {author.firstName && author.lastName
              ? `${author.firstName} ${author.lastName}`
              : author.username}
          </span>

          <span className="relative h-2 w-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-green-500 block" />
          </span>

          <span className="text-neutral-500 text-xs shrink-0">
            {publishedDate}
          </span>
        </Link>
      </div>

      {/* Cover du livre */}
      <div className="relative w-full aspect-3/4 overflow-hidden">
        <Link href={`/book/${book.slug}`} className="block group h-full w-full">
          {book.coverImage ? (
            <OptimizedImage
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              <FileText className="h-16 w-16 text-neutral-600" />
            </div>
          )}

          {/* Dégradé pour lisibilité */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        </Link>

        {/* Badge de statut (gratuit/payant) */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full backdrop-blur-md border border-white/15 ${
              isFree
                ? "text-green-400 bg-green-500/20 border-green-500/30"
                : "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
            }`}
          >
            {isFree ? "📥 Gratuit" : `💰 ${book.price?.toFixed(2)} €`}
          </span>
        </div>

        {/* Badge catégorie */}
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="absolute top-3 right-3 z-10 text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full hover:bg-black/70 hover:border-white/25 transition-colors"
          >
            {category.name}
          </Link>
        )}

        {/* Bouton de téléchargement (si gratuit) */}
        {isFree && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-blue-500/80 backdrop-blur-md border border-white/15 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-3.5 w-3.5" />
            {isDownloading ? "..." : "Télécharger"}
          </button>
        )}

        {/* Compteur de téléchargements */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full">
          <Download className="h-3 w-3" />
          <span>{book.downloadCount || 0}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 p-4 mt-auto">
        <Link href={`/book/${book.slug}`}>
          <h2 className="text-white font-semibold text-[15px] leading-snug hover:text-blue-400 transition-colors line-clamp-2">
            {book.title}
          </h2>
        </Link>

        {book.synopsis && (
          <p className="text-neutral-400 text-sm line-clamp-2">
            {book.synopsis}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="text-xs px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-tertiary)",
                }}
              >
                #{tag.name}
              </Link>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-neutral-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
          <div className="flex items-center gap-4 text-neutral-400 pt-3">
            <button
              onClick={toggleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 transition-all duration-200 active:scale-90 ${
                isLiked ? "text-red-500" : "hover:text-red-400"
              } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium tabular-nums">
                {likesCount}
              </span>
            </button>

            <Link
              href={`/book/${book.slug}#comments`}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm tabular-nums">
                {book.commentsCount || 0}
              </span>
            </Link>

            {!isFree && (
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Download className="h-4 w-4" />
                <span className="text-sm tabular-nums">
                  {book.downloadCount || 0}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={toggleBookmark}
            disabled={isBookmarking}
            className={`pt-3 transition-all duration-200 active:scale-90 ${
              isBookmarked
                ? "text-blue-400"
                : "text-neutral-400 hover:text-blue-400"
            } ${isBookmarking ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Bookmark
              className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Indicateur de prix */}
        {!isFree && (
          <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-800/60 pt-2">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Livre payant
            </span>
            <span className="text-yellow-400 font-medium">
              {book.price?.toFixed(2)} €
            </span>
          </div>
        )}

        {isFree && (
          <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-800/60 pt-2">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Livre numérique
            </span>
            <span className="text-green-400">Gratuit</span>
          </div>
        )}
      </div>
    </article>
  );
}
