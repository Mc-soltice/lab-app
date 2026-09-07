"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import { usePodcastDetail } from "@/hooks/blog/podcast/usePodcastDetail";
import { motion } from "framer-motion";
import { BouncyArc } from "ldrs/react";
import { Bookmark, Heart, MessageCircle, Pause, Play, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const slug = params.slug as string;

  const [commentText, setCommentText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    podcast,
    author,
    comments,
    isLoading,
    isError,
    error,
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,
    isLiking,
    isBookmarking,
    isSubmittingComment,
    toggleLike,
    toggleBookmark,
    submitComment,
    canInteract,
  } = usePodcastDetail(slug, {
    fetchComments: true,
    commentsLimit: 20,
    onError: (err) => console.error("Erreur dans usePodcastDetail:", err),
  });

  const authorDisplayName = useMemo(() => {
    if (!author) return "Auteur";
    return (
      [author.firstName, author.lastName].filter(Boolean).join(" ") || author.username
    );
  }, [author]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    if (!canInteract) {
      toast.error("Connectez-vous pour commenter");
      router.push("/login");
      return;
    }

    const result = await submitComment(commentText);
    if (result) {
      setCommentText("");
    }
  };

  if (isError) {
    return (
      <div
        className="min-h-screen px-4 py-8"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="mb-4 text-2xl font-light"
            style={{ color: "var(--text-primary)" }}
          >
            Podcast introuvable
          </h2>
          <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            {error?.message || "Le podcast demandé n'existe pas ou a été supprimé."}
          </p>
          <button
            onClick={() => router.push("/podcast")}
            className="rounded-xl px-6 py-2 text-sm font-medium transition-opacity"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-primary)",
            }}
          >
            Retour aux podcasts
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !podcast) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-blue-950/20 via-transparent to-blue-950/10">
        <BouncyArc size="90" speed="1.65" color="blue" />
        <p className="mt-4 text-sm font-light tracking-[0.2em] text-blue-300/80">
          Patience...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-(--bg-secondary) shadow-2xl">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div className="space-y-5">
              <div
                className="flex flex-wrap items-center gap-2 text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                {podcast.category && (
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    {podcast.category.name}
                  </span>
                )}
                <span>
                  {new Date(
                    podcast.publishedAt || podcast.createdAt,
                  ).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <div className="space-y-3">
                <h1
                  className="text-3xl font-semibold leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {podcast.title}
                </h1>
                <p
                  className="text-base leading-7"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {podcast.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--text-primary)",
                  }}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isPlaying ? "Pause" : "Écouter"}
                </button>

                <button
                  type="button"
                  onClick={toggleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all ${isLiked ? "text-red-500" : "text-(--text-secondary) hover:text-red-400"}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {likesCount}
                </button>

                <button
                  type="button"
                  onClick={toggleBookmark}
                  disabled={isBookmarking}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all ${isBookmarked ? "text-blue-400" : "text-(--text-secondary) hover:text-blue-400"}`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                  Enregistrer
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                {podcast.coverImage ? (
                  <img
                    src={podcast.coverImage}
                    alt={podcast.title}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center bg-linear-to-br from-blue-600/40 to-purple-600/40">
                    <Play className="h-16 w-16 text-white/80" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  {author?.avatar ? (
                    <img
                      src={author.avatar}
                      alt={authorDisplayName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {authorDisplayName}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {author?.bio || "Auteur"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-(--bg-secondary) p-6 shadow-xl lg:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Épisode
            </h2>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              <MessageCircle className="h-4 w-4" />
              {commentsCount}
            </div>
          </div>

          {podcast.mediaType === "VIDEO" ? (
            <video
              controls
              src={podcast.audioUrl}
              className="max-h-[32rem] w-full rounded-2xl"
              preload="metadata"
            />
          ) : (
            <audio
              controls
              src={podcast.audioUrl}
              className="w-full rounded-2xl"
              preload="metadata"
            />
          )}

          {podcast.transcript && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
              <h3
                className="mb-2 text-sm font-semibold uppercase tracking-[0.2em]"
                style={{ color: "var(--text-secondary)" }}
              >
                Transcription
              </h3>
              <p
                className="whitespace-pre-line text-sm leading-7"
                style={{ color: "var(--text-secondary)" }}
              >
                {podcast.transcript}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-(--bg-secondary) p-6 shadow-xl lg:p-8">
          <h2
            className="mb-4 text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Commentaires
          </h2>

          <form onSubmit={handleCommentSubmit} className="mb-6 space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              placeholder="Laisser un commentaire..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all hover:opacity-80 disabled:opacity-60"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--text-primary)",
              }}
            >
              {isSubmittingComment ? "Publication..." : "Publier"}
            </button>
          </form>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                Aucun commentaire pour le moment.
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-white/10 bg-black/10 p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {comment.author.firstName && comment.author.lastName
                        ? `${comment.author.firstName} ${comment.author.lastName}`
                        : comment.author.username}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-7"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
