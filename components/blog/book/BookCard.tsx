// components/ui/BookCard.tsx
"use client";

import OptimizedImage from "@/components/ui/OptimizedImage";
import { useInteractions } from "@/hooks/useInteractions";
import type { BookWithRelations } from "@/lib/services/book.service";
import { Bookmark, Download, FileText, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

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

  const { author, interactionState, category, tags } = book ?? {};

  const { isLiked, isBookmarked, isLiking, isBookmarking, toggleLike, toggleBookmark } =
    useInteractions({
      targetId: book?.id || "",
      targetType: "book",
      authorId: author?.id,
      currentUserId,
      initialLiked: interactionState?.isLiked || false,
      initialBookmarked: interactionState?.isBookmarked || false,
      initialLikesCount: book?.likesCount || 0,
    });

  if (!book) {
    return (
      <section className="h-full rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] min-h-75 flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Aucun livre à afficher</p>
      </section>
    );
  }

  const isFree = !book.price || book.price <= 0;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (book.price && book.price > 0) {
      toast.error("Ce livre est payant. Veuillez l'acheter pour le télécharger.");
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
        error instanceof Error ? error.message : "Erreur lors du téléchargement",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="group/card h-full w-full rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
      <div className="relative overflow-hidden rounded-[22px]">
        <Link href={`/book/${book.slug}`} className="block aspect-square">
          {book.coverImage ? (
            <OptimizedImage
              src={book.coverImage}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100">
              <FileText className="h-16 w-16 text-neutral-400" />
            </div>
          )}
        </Link>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label={`Télécharger le livre (${book.downloadCount || 0} téléchargements)`}
          className="absolute left-3 top-3 flex h-10 items-center gap-1.5 rounded-full bg-black/60 px-3 text-white backdrop-blur transition-all hover:bg-black/75 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} />
          <span className="text-xs font-medium">{book.downloadCount || 0}</span>
        </button>

        <button
          onClick={toggleBookmark}
          disabled={isBookmarking}
          aria-label={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-all active:scale-90 ${
            isBookmarking ? "cursor-not-allowed opacity-50" : "hover:bg-black/75"
          }`}
        >
          <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
        </button>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="mt-1 flex items-center gap-1.5">
          <Link href={`/book/${book.slug}`} className="min-w-0">
            <h2 className="truncate text-[16px] font-bold text-black hover:opacity-70">
              {book.title}
            </h2>
          </Link>
          {category && (
            <span className="truncate text-xs text-black/40">{category.name}</span>
          )}
        </div>

        {book.synopsis && (
          <p className="mt-2 line-clamp-2 text-[12px] leading-[1.45] text-black/60">
            {book.synopsis}
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="text-[11px] text-black/45 hover:text-black"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {!isFree && (
            <Link
              href={`/checkout/books/${book.id}`}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black text-[13px] font-medium text-white transition-opacity hover:opacity-80"
            >
              <ShoppingCart size={16} />
              Acheter {book.price?.toFixed(2)} €
            </Link>
          )}

          <button
            onClick={toggleLike}
            disabled={isLiking}
            aria-label={isLiked ? "Retirer le j'aime" : "Aimer ce livre"}
            className={`flex h-11 ${isFree ? "w-full" : "w-12"} items-center justify-center rounded-full bg-black text-white transition-all active:scale-90 ${
              isLiking ? "cursor-not-allowed opacity-50" : "hover:opacity-80"
            }`}
          >
            <Heart size={18} className={isLiked ? "fill-current text-red-400" : ""} />
          </button>
        </div>
      </div>
    </article>
  );
}
