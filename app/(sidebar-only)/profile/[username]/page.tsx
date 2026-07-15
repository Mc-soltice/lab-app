// app/profile/[username]/page.tsx
"use client";

import Card from "@/components/ui/Card";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useAuthContext } from "@/contexts/auth/auth.context";
import { useAuthorPosts } from "@/hooks/blog/post/useAuthorPosts";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Headphones,
  Image as ImageIcon,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Types
interface Author {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  bio: string | null;
  email?: string | null;
  coverImage?: string | null;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

interface FeedItem {
  post: {
    id: string;
    title: string;
    category: string;
    date: string;
    readTime: string;
    status?: string;
    coverImage?: string;
    likeCount?: number;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
}

// Composant Spinner réutilisable
const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function AuthorPage() {
  const params = useParams();
  const username = useMemo(
    () => decodeURIComponent(params?.username as string),
    [params?.username],
  );
  const { user: currentUser } = useAuthContext();

  const {
    posts,
    author,
    isLoading,
    isError,
    error,
    hasMore,
    total,
    loadMore,
    refresh,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    isFollowing,
    isFollowingAction,
    isLoadingMore,
    isRefreshing,
  } = useAuthorPosts({
    username,
    limit: 10,
    onError: useCallback((err: Error) => console.error(err), []),
  });
  const isOwner = Boolean(
    currentUser?.username && currentUser.username === username,
  );
  const TABS = useMemo(() => {
    const base = [
      { key: "articles", label: "Articles" },
      { key: "podcasts", label: "Podcasts" },
    ];
    if (isOwner) {
      base.push({ key: "brouillons", label: "Brouillons" });
      base.push({ key: "personnaliser", label: "Personnaliser" });
    }
    return base;
  }, [isOwner]);

  // États locaux pour la gestion des articles
  const [activeTab, setActiveTab] = useState("articles");
  const [savedNotice, setSavedNotice] = useState(false);
  const [localArticles, setLocalArticles] = useState<any[]>([]);
  const [localDrafts, setLocalDrafts] = useState<any[]>([]);
  const [localPodcasts, setLocalPodcasts] = useState<any[]>([]);
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(false);
  const [podcastError, setPodcastError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (!author) return "";
    return author.firstName || author.lastName
      ? `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim()
      : author.username;
  }, [author]);

  const stats = useMemo(() => {
    if (!author) return [];
    return [
      { label: "Articles", value: author.postsCount || 0 },
      { label: "Abonnés", value: author.followersCount || 0 },
      { label: "Abonnements", value: author.followingCount || 0 },
    ];
  }, [author]);

  // Mettre à jour les articles locaux quand les posts changent
  useEffect(() => {
    if (posts && posts.length > 0) {
      const published = posts.filter(
        (item) => item.post?.status === "PUBLISHED",
      );
      const drafts = isOwner
        ? posts.filter((item) => item.post?.status === "DRAFT")
        : [];
      setLocalArticles(published);
      setLocalDrafts(drafts);
    } else {
      setLocalArticles([]);
      setLocalDrafts([]);
    }
  }, [posts, isOwner]);

  useEffect(() => {
    let isCancelled = false;

    const fetchPodcasts = async () => {
      if (!username) return;

      setIsLoadingPodcasts(true);
      setPodcastError(null);

      try {
        const response = await fetch(
          `/api/users/${encodeURIComponent(username)}/podcasts?page=1&limit=10`,
          {
            headers: {
              "Cache-Control": "no-cache",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Impossible de charger les podcasts");
        }

        const data = await response.json();

        if (!isCancelled) {
          setLocalPodcasts(data.data || []);
        }
      } catch (error) {
        if (!isCancelled) {
          setPodcastError(
            error instanceof Error ? error.message : "Erreur de chargement",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPodcasts(false);
        }
      }
    };

    fetchPodcasts();

    return () => {
      isCancelled = true;
    };
  }, [username]);

  // --- États de chargement et d'erreur ---
  if (isLoading) {
    return (
      <div className="w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="animate-pulse space-y-8">
          <div className="h-28 sm:h-36 rounded-xl bg-gray-100" />
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-40 rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100" />
              <div className="h-3 w-56 rounded bg-gray-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !author) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-gray-900 text-lg font-medium">
            Auteur introuvable
          </p>
          <p className="text-gray-500 text-sm">
            {error?.message || "L'utilisateur recherché n'existe pas."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Couverture + avatar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mb-12 sm:mb-14"
      >
        <div className="h-28 sm:h-36 rounded-xl bg-linear-to-br from-indigo-50 to-pink-50 relative overflow-hidden">
          {(author as any).coverImage && (
            <OptimizedImage
              src={(author as any).coverImage}
              alt={displayName}
              width={768}
              height={144}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 sm:left-7 sm:translate-x-0 -bottom-9 sm:-bottom-10 flex items-end gap-3.5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-sm overflow-hidden">
            {author.avatar ? (
              <OptimizedImage
                src={author.avatar}
                alt={displayName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={28} className="text-gray-400" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Infos profil */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="px-1 mb-7 sm:mb-8 text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="font-serif text-xl sm:text-2xl font-medium mb-0.5">
            {displayName}
          </p>
          {!isOwner && (
            <button
              onClick={toggleFollow}
              disabled={isFollowingAction}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                isFollowing
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              } disabled:opacity-50`}
            >
              {isFollowingAction ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  ...
                </span>
              ) : isFollowing ? (
                "Suivi"
              ) : (
                "Suivre"
              )}
            </button>
          )}
        </div>
        {author.bio && (
          <p className="font-serif text-[15px] sm:text-base leading-relaxed mb-5 max-w-xl mx-auto sm:mx-0">
            {author.bio}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex justify-center sm:justify-start gap-5 sm:gap-7">
            {stats.map((stat) => (
              <div key={stat.label}>
                <span className="text-sm sm:text-[15px] font-medium">
                  {stat.value}
                </span>{" "}
                <span className="text-xs sm:text-[13px] text-gray-400">
                  {stat.label.toLowerCase()}
                </span>
              </div>
            ))}
          </div>

          {(author as any).email && (
            <div className="flex justify-center sm:justify-end">
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-2.5 h-8">
                <Mail size={13} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500">
                  {(author as any).email}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Navigation par onglets */}
      <div className="relative mb-6">
        <div
          className="flex justify-center gap-5 sm:gap-7 border-b border-gray-200 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm pb-3 -mb-px border-b-2 whitespace-nowrap shrink-0 transition ${
                activeTab === tab.key
                  ? "border-gray-900 text-gray-900 font-medium"
                  : "border-transparent text-gray-400"
              }`}
            >
              {tab.label}
              {tab.key === "brouillons" && localDrafts.length > 0 && (
                <span className="ml-1.5 text-[11px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                  {localDrafts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Onglet Articles */}
      {activeTab === "articles" && (
        <AnimatePresence mode="popLayout">
          {localArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center space-y-2"
            >
              <p className="text-gray-900 text-base">Aucun article publié</p>
              <p className="text-gray-500 text-sm">
                {displayName} n'a pas encore publié d'articles.
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {localArticles.map((item) => (
                <Card
                  key={item.post.id}
                  post={item}
                  currentUserId={currentUser?.id}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Onglet Podcasts */}
      {activeTab === "podcasts" && (
        <AnimatePresence mode="popLayout">
          {isLoadingPodcasts ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center text-sm text-gray-500"
            >
              Chargement des podcasts...
            </motion.div>
          ) : podcastError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center space-y-2"
            >
              <p className="text-gray-900 text-base">
                Impossible de charger les podcasts
              </p>
              <p className="text-gray-500 text-sm">{podcastError}</p>
            </motion.div>
          ) : localPodcasts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center space-y-2"
            >
              <p className="text-gray-900 text-base">Aucun podcast publié</p>
              <p className="text-gray-500 text-sm">
                {displayName} n'a pas encore publié de podcasts.
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {localPodcasts.map((podcast) => (
                <Link
                  key={podcast.id}
                  href={`/podcast/${podcast.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    {podcast.coverImage ? (
                      <OptimizedImage
                        src={podcast.coverImage}
                        alt={podcast.title}
                        width={640}
                        height={360}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-linear-to-br from-indigo-50 to-pink-50">
                        <Headphones className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {podcast.title}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {podcast.description || "Aucune description disponible."}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <Headphones size={13} />
                      <span>
                        {podcast.duration
                          ? `${Math.floor(podcast.duration / 60)} min`
                          : "Audio"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Onglet Brouillons */}
      {activeTab === "brouillons" && (
        <AnimatePresence mode="popLayout">
          {localDrafts.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-400 text-center py-10"
            >
              Aucun brouillon pour le moment.
            </motion.p>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
            >
              {localDrafts.map((item) => (
                <Card
                  key={item.post.id}
                  post={item}
                  currentUserId={currentUser?.id}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Onglet Personnaliser */}
      {activeTab === "personnaliser" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-xl mx-auto sm:mx-0 space-y-5"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
              {author.avatar ? (
                <OptimizedImage
                  src={author.avatar}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={22} className="text-gray-400" />
              )}
              <button
                type="button"
                aria-label="Changer la photo de profil"
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center border-2 border-white"
              >
                <Camera size={11} className="text-white" />
              </button>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition"
            >
              <ImageIcon size={13} />
              Changer la couverture
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nom</label>
            <input
              type="text"
              value={displayName}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Bio</label>
            <textarea
              rows={3}
              value={author.bio || ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">E-mail</label>
            <input
              type="email"
              value={(author as any).email || ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm border border-indigo-300 text-indigo-600 rounded-lg px-4 py-2 hover:bg-indigo-50 transition"
            >
              <Check size={14} />
              Enregistrer
            </button>
            {savedNotice && (
              <span className="text-xs text-emerald-600">
                Modifications enregistrées
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Charger plus */}
      {hasMore && localArticles.length > 0 && activeTab === "articles" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center mt-10"
        >
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 text-sm text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Chargement...
              </span>
            ) : (
              "Voir plus"
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
