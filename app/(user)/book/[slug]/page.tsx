// app/(user)/books/[slug]/page.tsx
"use client";

import OptimizedImage from "@/components/ui/OptimizedImage";
import { useAuthContext } from "@/contexts/auth/auth.context";
import { useBookDetail } from "@/hooks/blog/book/useBookDetail";
import { useInteractions } from "@/hooks/useInteractions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { BouncyArc } from "ldrs/react";
import {
  ArrowLeft,
  Bookmark,
  Download,
  ExternalLink,
  FileText,
  Heart,
  MessageCircle,
  Share2,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const slug = params.slug as string;

  const { book, author, isLoading, isError, error, reload } = useBookDetail(
    slug,
    {
      onError: (err) => {
        console.error("Erreur dans useBookDetail:", err);
      },
    },
  );

  const {
    isLiked,
    isBookmarked,
    likesCount,
    isLiking,
    isBookmarking,
    toggleLike,
    toggleBookmark,
    canInteract,
  } = useInteractions({
    targetId: book?.id || "",
    targetType: "book",
    authorId: author?.id || "",
    currentUserId: user?.id,
    initialLiked: false,
    initialBookmarked: false,
    initialLikesCount: book?.likesCount || 0,
  });

  const [isDownloading, setIsDownloading] = useState(false);

  // Redirection si le livre n'existe pas
  useEffect(() => {
    if (!isLoading && !book && !isError) {
      toast.error("Livre non trouvé");
      router.push("/books");
    }
  }, [book, isLoading, router, isError]);

  // Gestion du téléchargement
  const handleDownload = async () => {
    if (!book) return;

    // Vérifier si le livre est gratuit
    if (book.price && book.price > 0) {
      toast.error(
        "Ce livre est payant. Veuillez l'acheter pour le télécharger.",
      );
      return;
    }

    setIsDownloading(true);
    try {
      if (book.fileUrl) {
        window.open(book.fileUrl, "_blank");
        toast.success("Téléchargement commencé !");
        return;
      }

      const response = await fetch(`/api/books/${book.id}/download`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      const data = await response.json();

      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
        toast.success("Téléchargement commencé !");
      }
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setIsDownloading(false);
    }
  };

  // Formater la date
  const publishedDate = book?.publishedAt
    ? format(new Date(book.publishedAt), "dd MMMM yyyy", { locale: fr })
    : "Date non disponible";

  // Vérifier si le livre est gratuit
  const isFree = !book?.price || book.price <= 0;

  if (isError) {
    return (
      <div
        className="min-h-screen py-8 px-4"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-2xl font-light mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Livre introuvable
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {error?.message ||
              "Le livre que vous recherchez n'existe pas ou a été supprimé."}
          </p>
          <button
            onClick={() => router.push("/books")}
            className="px-6 py-2 text-sm font-medium rounded-xl transition-opacity"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-primary)",
            }}
          >
            Retour à la bibliothèque
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-950/20 via-transparent to-blue-950/10">
        <BouncyArc size="90" speed="1.65" color="blue" />
        <p className="text-sm font-light text-blue-300/80 tracking-[0.2em] mt-4">
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la bibliothèque
        </Link>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cover */}
          <div className="lg:col-span-1">
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden border border-neutral-800/80 shadow-xl">
              {book.coverImage ? (
                <OptimizedImage
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <FileText className="h-20 w-20 text-neutral-600" />
                </div>
              )}

              {/* Badge statut */}
              <div className="absolute top-4 left-4 z-10">
                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15 ${
                    isFree
                      ? "text-green-400 bg-green-500/20 border-green-500/30"
                      : "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
                  }`}
                >
                  {isFree ? "📥 Gratuit" : `💰 ${book.price?.toFixed(2)} €`}
                </span>
              </div>

              {/* Badge téléchargements */}
              <div className="absolute bottom-4 left-4 z-10">
                <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Download className="h-3 w-3" />
                  {book.downloadCount || 0} téléchargements
                </span>
              </div>
            </div>
          </div>

          {/* Infos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Titre et actions */}
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {book.title}
              </h1>

              {book.category && (
                <Link
                  href={`/category/${book.category.slug}`}
                  className="inline-flex items-center gap-1 text-sm mt-2 hover:opacity-80 transition-opacity"
                  style={{ color: "var(--accent)" }}
                >
                  <Tag className="h-3.5 w-3.5" />
                  {book.category.name}
                </Link>
              )}
            </div>

            {/* Auteur */}
            <div
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{ borderColor: "var(--border)" }}
            >
              {author?.avatar ? (
                <OptimizedImage
                  src={author.avatar}
                  alt={author.username}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <Link
                  href={`/@${author?.username}`}
                  className="font-medium hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-primary)" }}
                >
                  {author?.firstName && author?.lastName
                    ? `${author.firstName} ${author.lastName}`
                    : author?.username}
                </Link>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Publié le {publishedDate}
                </p>
              </div>
            </div>

            {/* Synopsis */}
            {book.synopsis && (
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Synopsis
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-primary)" }}
                >
                  {book.synopsis}
                </p>
              </div>
            )}

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {book.tags.map(
                  (tag: { id: string; slug: string; name: string }) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="px-3 py-1 text-xs rounded-full transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      #{tag.name}
                    </Link>
                  ),
                )}
              </div>
            )}

            {/* Actions */}
            <div
              className="flex flex-wrap items-center gap-3 pt-4 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Like */}
              <button
                onClick={toggleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 ${
                  isLiked
                    ? "text-red-500 bg-red-500/10 border border-red-500/20"
                    : "hover:bg-neutral-800 border border-transparent hover:border-neutral-700"
                } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ color: isLiked ? "#EF4444" : "var(--text-secondary)" }}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                <span>{likesCount}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={toggleBookmark}
                disabled={isBookmarking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 ${
                  isBookmarked
                    ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                    : "hover:bg-neutral-800 border border-transparent hover:border-neutral-700"
                } ${isBookmarking ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  color: isBookmarked ? "#60A5FA" : "var(--text-secondary)",
                }}
              >
                <Bookmark
                  className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
                />
                <span>{isBookmarked ? "Sauvegardé" : "Sauvegarder"}</span>
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  navigator
                    .share?.({
                      title: book.title,
                      text: book.synopsis || "",
                      url: window.location.href,
                    })
                    .catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Lien copié !");
                    });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-neutral-800 border border-transparent hover:border-neutral-700"
                style={{ color: "var(--text-secondary)" }}
              >
                <Share2 className="h-5 w-5" />
                <span>Partager</span>
              </button>

              {/* Download (si gratuit) */}
              {isFree && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ml-auto ${
                    isDownloading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-85"
                  }`}
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--text-primary)",
                  }}
                >
                  <Download className="h-5 w-5" />
                  {isDownloading
                    ? "Téléchargement..."
                    : "Télécharger gratuitement"}
                </button>
              )}

              {/* Acheter (si payant) */}
              {!isFree && (
                <button
                  onClick={() => {
                    // Rediriger vers la page de paiement
                    router.push(`/checkout/books/${book.id}`);
                  }}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ml-auto hover:opacity-85"
                  style={{
                    backgroundColor: "#F59E0B",
                    color: "#000",
                  }}
                >
                  <ExternalLink className="h-5 w-5" />
                  Acheter {book.price?.toFixed(2)} €
                </button>
              )}
            </div>

            {/* Commentaires */}
            <div
              className="pt-6 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Commentaires
                </h3>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {book.commentsCount || 0} commentaire
                  {book.commentsCount > 1 ? "s" : ""}
                </span>
              </div>

              {/* Section commentaires à implémenter avec un composant dédié */}
              <div
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <p
                  className="text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <MessageCircle className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  Les commentaires arrivent bientôt
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton rafraîchissement */}
      <div className="max-w-4xl mx-auto mt-4 flex justify-end">
        <button
          onClick={reload}
          className="text-xs hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-tertiary)" }}
        >
          ↻ Rafraîchir
        </button>
      </div>
    </motion.div>
  );
}
