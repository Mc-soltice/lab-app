<files>
<file name="contexts\auth\auth.context.tsx">
<![CDATA[
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, {
createContext,
useCallback,
useContext,
useMemo,
useState,
} from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { RegisterSchema } from "../../lib/validation/schemas";

type CreateUserPayload = z.infer<typeof RegisterSchema>;

type AuthContextValue = {
register: (data: CreateUserPayload) => Promise<void>;
login: (email: string, password: string) => Promise<void>;
logout: () => Promise<void>;
isLoading: boolean;
isAuthenticated: boolean;
user: any | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function registerUser(data: CreateUserPayload) {
const response = await fetch("/api/auth/register", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data),
});

if (!response.ok) {
const error = await response.json();
throw new Error(error.error || "Erreur lors de l'inscription");
}

return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
const router = useRouter();
const [isLoading, setIsLoading] = useState(false);
const { data: session, status } = useSession();
const isAuthenticated = status === "authenticated";
const user = session?.user ?? null;

const login = useCallback(
async (email: string, password: string) => {
setIsLoading(true);
try {
const res = await signIn("credentials", {
email,
password,
redirect: false,
});

        if (res?.error) {
          toast.error(res.error);
          throw new Error(res.error);
        }

        toast.success("Connexion réussie");
        router.push("/home");
        router.refresh();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router],

);

const register = useCallback(
async (data: CreateUserPayload) => {
setIsLoading(true);
try {
await registerUser(data);
toast.success("Compte créé avec succès");
await login(data.email, data.password);
} catch (error) {
toast.error(
error instanceof Error
? error.message
: "Erreur lors de l'inscription",
);
throw error;
} finally {
setIsLoading(false);
}
},
[login],
);

const logout = useCallback(async () => {
try {
await signOut({ redirect: false });
router.replace("/login");
router.refresh();
} catch (error) {
console.error("Logout error:", error);
toast.error("Erreur lors de la déconnexion");
}
}, [router]);

const value = useMemo<AuthContextValue>(
() => ({ register, login, logout, isLoading, isAuthenticated, user }),
[register, login, logout, isLoading, isAuthenticated, user],
);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
const ctx = useContext(AuthContext);
if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
return ctx;
}

]]>
</file>
<file name="hooks\useAuth.ts">

<![CDATA[
"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";

export function useAuth() {
  return useAuthContext();
}

export default useAuth;

]]>
</file>
<file name="components\Header.tsx">
<![CDATA[
"use client";

import { useFollowing } from "@/hooks/blog/useFollowing";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export default function Header() {
const { data: session } = useSession();
const user = session?.user as any | undefined;

const {
authors: followedAuthors,
isLoading,
hasMore,
} = useFollowing({
limit: 8, // Afficher 8 auteurs maximum dans le header
});

const displayName = user?.username || user?.name || "John Doe";
const avatar = user?.avatar || user?.image || null;

const initials = useMemo(() => {
const parts = String(displayName).trim().split(/\s+/);
if (parts.length === 0) return "JD";
if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}, [displayName]);

return (

<header className="sticky top-4 z-20 rounded-3xl border border-neutral-800 bg-[#1b1b1b] p-3 sm:p-4">
<div className="flex items-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
{/_ Profile Section _/}
<div className="flex flex-col items-center gap-1 sm:gap-2 shrink-0">
<div className="relative">
{avatar ? (
<Image
                src={avatar}
                alt={displayName}
                width={64}
                height={64}
                className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full object-cover"
              />
) : (
<div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg">
{initials}
</div>
)}

            <div className="absolute bottom-0 right-0 h-4 w-4 sm:h-4 sm:w-4 bg-green-500 rounded-full border-2 border-[#181818]" />
          </div>

          <span className="text-xs sm:text-sm text-white truncate max-w-16">
            {displayName}
          </span>
        </div>

        {/* Liste des auteurs suivis */}
        {isLoading ? (
          // Squelette de chargement
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`loading-${i}`}
              className="flex flex-col items-center gap-1 sm:gap-2 shrink-0 animate-pulse"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-neutral-700" />
              <div className="h-2 w-8 sm:h-3 sm:w-10 rounded bg-neutral-700" />
            </div>
          ))
        ) : followedAuthors.length === 0 ? (
          <div className="text-xs text-neutral-400 px-4 py-2">
            Suivez des auteurs pour les voir ici
          </div>
        ) : (
          <>
            {followedAuthors.slice(0, 8).map((author) => (
              <Link
                key={author.id}
                href={`/profile/${author.username}`}
                className="flex flex-col items-center gap-1 sm:gap-2 shrink-0 group"
              >
                {author.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.username}
                    width={64}
                    height={64}
                    className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full object-cover border-2 border-neutral-600 group-hover:border-blue-400 transition-colors"
                  />
                ) : (
                  <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-linear-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-neutral-600 group-hover:border-blue-400 transition-colors">
                    {author.username[0].toUpperCase()}
                  </div>
                )}

                <span className="text-xs sm:text-sm text-neutral-400 group-hover:text-white transition-colors truncate max-w-16">
                  @{author.username}
                </span>
              </Link>
            ))}

            {/* Lien "Voir plus" si nécessaire */}
            {hasMore && (
              <Link
                href="/following"
                className="flex flex-col items-center gap-1 sm:gap-2 shrink-0 group"
              >
                <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full border-2 border-dashed border-neutral-600 hover:border-blue-400 transition-colors flex items-center justify-center">
                  <span className="text-2xl text-neutral-400 group-hover:text-blue-400 transition-colors">
                    +
                  </span>
                </div>
                <span className="text-xs text-neutral-400">Voir plus</span>
              </Link>
            )}
          </>
        )}
      </div>
    </header>

);
}

]]>
</file>
<file name="app\api\users\[username]\route.ts">

<![CDATA[
// app/api/users/[username]/route.ts - CORRIGÉ
import { getCurrentUser } from "@/lib/auth/session";
import { handleError } from "@/lib/error-handler";
import { UserService } from "@/lib/services/user.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userService = new UserService();

const UsernameParamSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }, // ✅ Promise
) {
  try {
    // ✅ Attendre les params
    const { username } = await params;
    const validated = UsernameParamSchema.parse({ username });

    // Optionnel : récupérer l'utilisateur courant pour des données personnalisées
    const currentUser = await getCurrentUser();

    const user = await userService.getProfile(validated.username);

    // Ne jamais renvoyer le mot de passe hashé
    const { password: _password, ...publicProfile } = user;

    // Ajouter des informations de suivi si l'utilisateur est connecté
    if (currentUser && currentUser.id !== user.id) {
      // Vous pouvez ajouter ici des infos comme isFollowing
      // publicProfile.isFollowing = await checkIfFollowing(currentUser.id, user.id);
    }

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error("[User Profile API] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Nom d'utilisateur invalide", details: error.errors },
        { status: 400 },
      );
    }
    return handleError(error);
  }
}

]]>
</file>
<file name="hooks\blog\useAuthorPosts.ts">
<![CDATA[
// hooks/blog/useAuthorPosts.ts
"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import { FeedItem, FeedResponse } from "@/lib/services/feed.service";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface UseAuthorPostsOptions {
initialPage?: number;
limit?: number;
username: string;
onSuccess?: (data: FeedResponse) => void;
onError?: (error: Error) => void;
}

export interface UseAuthorPostsReturn {
// Données
posts: FeedItem[];
author: FeedItem["author"] | null;
isLoading: boolean;
isError: boolean;
error: Error | null;

// Pagination
page: number;
total: number;
totalPages: number;
hasMore: boolean;

// Méthodes
loadMore: () => Promise<void>;
refresh: () => Promise<void>;
goToPage: (page: number) => Promise<void>;
toggleLike: (postId: string) => Promise<void>;
toggleBookmark: (postId: string) => Promise<void>;
toggleFollow: () => Promise<void>;

// États des interactions
isFollowing: boolean;
isLiking: boolean;
isBookmarking: boolean;
isFollowingAction: boolean;

// États de chargement
isLoadingMore: boolean;
isRefreshing: boolean;
}

export function useAuthorPosts(
options: UseAuthorPostsOptions,
): UseAuthorPostsReturn {
const { user, isAuthenticated } = useAuthContext();
const { username, initialPage = 1, limit = 10, onSuccess, onError } = options;

// États principaux
const [posts, setPosts] = useState<FeedItem[]>([]);
const [author, setAuthor] = useState<FeedItem["author"] | null>(null);
const [page, setPage] = useState(initialPage);
const [total, setTotal] = useState(0);
const [totalPages, setTotalPages] = useState(0);
const [isLoading, setIsLoading] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [isRefreshing, setIsRefreshing] = useState(false);
const [isError, setIsError] = useState(false);
const [error, setError] = useState<Error | null>(null);

// États d'interaction
const [isFollowing, setIsFollowing] = useState(false);
const [isLiking, setIsLiking] = useState(false);
const [isBookmarking, setIsBookmarking] = useState(false);
const [isFollowingAction, setIsFollowingAction] = useState(false);

// Refs pour éviter les re-rendus inutiles
const isMounted = useRef(true);
const abortController = useRef<AbortController | null>(null);
const initialLoadDone = useRef(false);
const currentUsername = useRef(username);

// ✅ Computed values
const hasMore = page < totalPages;

// Nettoyage
useEffect(() => {
return () => {
isMounted.current = false;
if (abortController.current) {
abortController.current.abort();
}
};
}, []);

/\*\*

- Récupère les posts d'un auteur
  \*/
  const fetchAuthorPosts = useCallback(
  async (pageToFetch: number, isInitialLoad: boolean = false) => {
  // Annuler la requête précédente
  if (abortController.current) {
  abortController.current.abort();
  }

      const controller = new AbortController();
      abortController.current = controller;

      const isFirstPage = pageToFetch === 1;

      // ✅ Éviter les mises à jour d'état inutiles
      if (isFirstPage && !isInitialLoad) {
        setIsLoading(true);
      }
      if (!isFirstPage) {
        setIsLoadingMore(true);
      }

      setIsError(false);
      setError(null);

      try {
        const url = `/api/users/${encodeURIComponent(username)}/posts?page=${pageToFetch}&limit=${limit}`;
        console.log(`👤 Chargement des posts de ${username}: ${url}`);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Erreur lors du chargement des posts",
          );
        }

        const data = await response.json();

        if (!isMounted.current) return;

        // Transformer les données en FeedItems
        const feedItems = data.data.map((post: any) => {
          const postAuthor = post.author || {
            id: post.authorId,
            username: "unknown",
            firstName: null,
            lastName: null,
            avatar: null,
          };

          return {
            post: {
              ...post,
              author: {
                id: postAuthor.id,
                username: postAuthor.username,
                firstName: postAuthor.firstName,
                lastName: postAuthor.lastName,
                avatar: postAuthor.avatar,
              },
              category: post.category || null,
              tags: post.tags || [],
            },
            author: {
              id: postAuthor.id,
              username: postAuthor.username,
              firstName: postAuthor.firstName,
              lastName: postAuthor.lastName,
              avatar: postAuthor.avatar,
              bio: postAuthor.bio || null,
              postsCount:
                post._count?.posts || data.meta?.authorPostsCount || 0,
              followersCount: post._count?.followers || 0,
              followingCount: post._count?.following || 0,
            },
            interactionState: {
              isLiked: post.isLiked || false,
              isBookmarked: post.isBookmarked || false,
              isFollowing: post.isFollowing || false,
            },
          };
        });

        // ✅ Mettre à jour les states en un seul batch
        if (isFirstPage) {
          setPosts(feedItems);
          if (feedItems.length > 0) {
            setAuthor(feedItems[0].author);
            setIsFollowing(feedItems[0].interactionState?.isFollowing || false);
          } else {
            setAuthor(null);
            setIsFollowing(false);
          }
        } else {
          setPosts((prev) => [...prev, ...feedItems]);
        }

        setPage(data.meta.page);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);

        if (onSuccess) {
          onSuccess(data);
        }

        console.log(`✅ ${feedItems.length} posts de ${username} chargés`);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("🛑 Requête annulée");
          return;
        }

        if (!isMounted.current) return;

        console.error(
          `❌ Erreur lors du chargement des posts de ${username}:`,
          err,
        );
        setIsError(true);
        setError(err);

        if (onError) {
          onError(err);
        }

        toast.error(err.message || "Erreur lors du chargement des posts");
      } finally {
        if (isMounted.current) {
          // ✅ Réduire les mises à jour d'état en cascade
          if (isFirstPage) {
            setIsLoading(false);
          }
          setIsLoadingMore(false);
          setIsRefreshing(false);
        }
        if (abortController.current === controller) {
          abortController.current = null;
        }
      }

  },
  [username, limit, onSuccess, onError],
  );

/\*\*

- Charger plus de posts
  \*/
  const loadMore = useCallback(async () => {
  if (!hasMore || isLoadingMore || isLoading) return;
  await fetchAuthorPosts(page + 1);
  }, [hasMore, isLoadingMore, isLoading, page, fetchAuthorPosts]);

/\*\*

- Rafraîchir la liste
  \*/
  const refresh = useCallback(async () => {
  setIsRefreshing(true);
  await fetchAuthorPosts(1);
  }, [fetchAuthorPosts]);

/\*\*

- Aller à une page spécifique
  \*/
  const goToPage = useCallback(
  async (newPage: number) => {
  if (newPage < 1 || newPage > totalPages || newPage === page) return;
  await fetchAuthorPosts(newPage);
  },
  [page, totalPages, fetchAuthorPosts],
  );

/\*\*

- Toggle Like pour un post
  \*/
  const toggleLike = useCallback(
  async (postId: string) => {
  if (!isAuthenticated) {
  toast.error("Connectez-vous pour aimer un article");
  return;
  }

      if (isLiking) return;
      setIsLiking(true);

      const postIndex = posts.findIndex((item) => item.post.id === postId);
      if (postIndex === -1) {
        setIsLiking(false);
        return;
      }

      const currentItem = posts[postIndex];
      const isCurrentlyLiked = currentItem.interactionState?.isLiked || false;
      const newIsLiked = !isCurrentlyLiked;

      // Optimistic update
      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...currentItem,
        interactionState: {
          ...currentItem.interactionState!,
          isLiked: newIsLiked,
        },
        post: {
          ...currentItem.post,
          likesCount: newIsLiked
            ? (currentItem.post.likesCount || 0) + 1
            : (currentItem.post.likesCount || 0) - 1,
        },
      };
      setPosts(updatedPosts);

      try {
        const response = await fetch("/api/interactions/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "post",
            id: postId,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors du like");
        }

        const data = await response.json();

        // Mettre à jour avec la valeur du serveur
        updatedPosts[postIndex] = {
          ...currentItem,
          interactionState: {
            ...currentItem.interactionState!,
            isLiked: data.liked,
          },
          post: {
            ...currentItem.post,
            likesCount: data.liked
              ? (currentItem.post.likesCount || 0) + 1
              : (currentItem.post.likesCount || 0) - 1,
          },
        };
        setPosts(updatedPosts);
      } catch (err: any) {
        console.error("❌ Erreur toggleLike:", err);
        // Rollback
        setPosts(posts);
        toast.error(err.message || "Erreur lors du like");
      } finally {
        setIsLiking(false);
      }

  },
  [isAuthenticated, isLiking, posts],
  );

/\*\*

- Toggle Bookmark pour un post
  \*/
  const toggleBookmark = useCallback(
  async (postId: string) => {
  if (!isAuthenticated) {
  toast.error("Connectez-vous pour sauvegarder un article");
  return;
  }

      if (isBookmarking) return;
      setIsBookmarking(true);

      const postIndex = posts.findIndex((item) => item.post.id === postId);
      if (postIndex === -1) {
        setIsBookmarking(false);
        return;
      }

      const currentItem = posts[postIndex];
      const isCurrentlyBookmarked =
        currentItem.interactionState?.isBookmarked || false;
      const newIsBookmarked = !isCurrentlyBookmarked;

      // Optimistic update
      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...currentItem,
        interactionState: {
          ...currentItem.interactionState!,
          isBookmarked: newIsBookmarked,
        },
      };
      setPosts(updatedPosts);

      try {
        const response = await fetch("/api/interactions/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "post",
            id: postId,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors du bookmark");
        }

        const data = await response.json();

        updatedPosts[postIndex] = {
          ...currentItem,
          interactionState: {
            ...currentItem.interactionState!,
            isBookmarked: data.bookmarked,
          },
        };
        setPosts(updatedPosts);

        toast.success(
          data.bookmarked ? "📑 Ajouté aux favoris" : "Retiré des favoris",
        );
      } catch (err: any) {
        console.error("❌ Erreur toggleBookmark:", err);
        setPosts(posts);
        toast.error(err.message || "Erreur lors du bookmark");
      } finally {
        setIsBookmarking(false);
      }

  },
  [isAuthenticated, isBookmarking, posts],
  );

/\*\*

- Toggle Follow pour l'auteur
  \*/
  const toggleFollow = useCallback(async () => {
  if (!isAuthenticated) {
  toast.error("Connectez-vous pour suivre un auteur");
  return;
  }

  if (isFollowingAction) return;
  setIsFollowingAction(true);

  const previousFollowing = isFollowing;
  const newIsFollowing = !isFollowing;

  // Optimistic update
  setIsFollowing(newIsFollowing);

  try {
  const response = await fetch(
  `/api/users/${encodeURIComponent(username)}/follow`,
  {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  },
  );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors du follow");
      }

      const data = await response.json();
      setIsFollowing(data.following);

      // Mettre à jour tous les posts avec le nouveau statut de follow
      setPosts((prev) =>
        prev.map((item) => ({
          ...item,
          interactionState: {
            ...item.interactionState!,
            isFollowing: data.following,
          },
        })),
      );

      toast.success(
        data.following
          ? `👤 Vous suivez maintenant ${username}`
          : `Vous ne suivez plus ${username}`,
      );

  } catch (err: any) {
  console.error("❌ Erreur toggleFollow:", err);
  setIsFollowing(previousFollowing);
  toast.error(err.message || "Erreur lors du follow");
  } finally {
  setIsFollowingAction(false);
  }

}, [isAuthenticated, isFollowingAction, isFollowing, username]);

// ✅ Chargement initial optimisé - Évite les re-rendus en cascade
useEffect(() => {
// Ne rien faire si le username est vide
if (!username) return;

    // Réinitialiser si le username change
    if (currentUsername.current !== username) {
      currentUsername.current = username;
      initialLoadDone.current = false;
      // Réinitialiser les states
      setPosts([]);
      setAuthor(null);
      setPage(initialPage);
      setTotal(0);
      setTotalPages(0);
      setIsLoading(true);
      setIsError(false);
      setError(null);
    }

    // Éviter les doubles appels
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    // Charger les posts
    fetchAuthorPosts(initialPage, true);

}, [username, initialPage, fetchAuthorPosts]);

return {
// Données
posts,
author,
isLoading,
isError,
error,

    // Pagination
    page,
    total,
    totalPages,
    hasMore,

    // Méthodes
    loadMore,
    refresh,
    goToPage,
    toggleLike,
    toggleBookmark,
    toggleFollow,

    // États des interactions
    isFollowing,
    isLiking,
    isBookmarking,
    isFollowingAction,

    // États de chargement
    isLoadingMore,
    isRefreshing,

};
}

]]>
</file>
<file name="lib\services\post.service.ts">

<![CDATA[
// lib/services/post.service.ts
import { Post, Prisma } from "@/prisma/generated/client";
import slugify from "slugify";
import { z } from "zod";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../exceptions";
import { CategoryRepository } from "../repositories/category.repository";
import { PostRepository } from "../repositories/post.repository";
import { UserRepository } from "../repositories/user.repository";
import { CreatePostSchema, UpdatePostSchema } from "../validation/schemas";

export class PostService {
  private postRepository = new PostRepository();
  private userRepository = new UserRepository();
  private categoryRepository = new CategoryRepository();

  async createPost(
    authorId: string,
    data: z.infer<typeof CreatePostSchema>,
  ): Promise<Post> {
    const user = await this.userRepository.findById(authorId);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) throw new NotFoundException("Catégorie non trouvée");
    }

    const slug = this.generateSlug(data.title);
    const existingPost = await this.postRepository.findBySlug(slug);
    if (existingPost)
      throw new ConflictException("Un article avec ce titre existe déjà");

    const postData: Prisma.PostCreateInput = {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt || data.content.substring(0, 200),
      coverImage: data.coverImage,
      status: data.status || "DRAFT",
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      author: { connect: { id: authorId } },
      category: data.categoryId
        ? { connect: { id: data.categoryId } }
        : undefined,
      tags: data.tags?.length
        ? {
            create: data.tags.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    };

    return this.postRepository.create(postData);
  }

  async getPostBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findBySlug(slug);
    if (!post || post.status !== "PUBLISHED") {
      throw new NotFoundException("Article non trouvé");
    }
    await this.postRepository.incrementViews(post.id);
    return post;
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundException("Article non trouvé");
    return post;
  }

  async updatePost(
    id: string,
    userId: string,
    data: z.infer<typeof UpdatePostSchema>,
  ): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundException("Article non trouvé");
    if (post.authorId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cet article",
      );
    }

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) throw new NotFoundException("Catégorie non trouvée");
    }

    const updateData: Prisma.PostUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = this.generateSlug(data.title);
    }
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.categoryId !== undefined) {
      updateData.category = data.categoryId
        ? { connect: { id: data.categoryId } }
        : { disconnect: true };
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "PUBLISHED" && post.status !== "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
    }

    return this.postRepository.update(id, updateData);
  }

  async deletePost(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundException("Article non trouvé");
    if (post.authorId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer cet article",
      );
    }
    await this.postRepository.delete(id);
  }

  async getFeed(userId?: string, page = 1, limit = 10) {
    return this.postRepository.getFeed(userId, page, limit);
  }

  async getUserPosts(username: string, page = 1, limit = 10) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");
    return this.postRepository.findByAuthor(user.id, page, limit);
  }

  async searchPosts(query: string, page = 1, limit = 10) {
    if (!query || query.length < 2) return { data: [], total: 0 };
    return this.postRepository.search(query, page, limit);
  }

  private generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
}

]]>
</file>
<file name="lib\repositories\post.repository.ts">
<![CDATA[
// lib/repositories/post.repository.ts
import { Post, Prisma, PrismaClient } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

const AUTHOR_SELECT = {
id: true,
username: true,
firstName: true,
lastName: true,
avatar: true,
} satisfies Prisma.UserSelect;

export class PostRepository {
private db: PrismaClient;

constructor() {
this.db = prisma;
}

async create(data: Prisma.PostCreateInput): Promise<Post> {
return this.db.post.create({ data });
}

async findById(id: string): Promise<Post | null> {
return this.db.post.findUnique({
where: { id },
include: {
author: { select: AUTHOR_SELECT },
category: { select: { id: true, name: true, slug: true } },
tags: {
include: { tag: { select: { id: true, name: true, slug: true } } },
},
},
});
}

async findBySlug(slug: string): Promise<Post | null> {
return this.db.post.findUnique({
where: { slug },
include: {
author: { select: AUTHOR_SELECT },
category: { select: { id: true, name: true, slug: true } },
tags: {
include: { tag: { select: { id: true, name: true, slug: true } } },
},
},
});
}

async findByAuthor(
authorId: string,
page = 1,
limit = 10,
): Promise<{ data: Post[]; total: number }> {
const skip = (page - 1) \* limit;
const [data, total] = await Promise.all([
this.db.post.findMany({
where: { authorId, status: "PUBLISHED" },
skip,
take: limit,
orderBy: { publishedAt: "desc" },
include: {
author: { select: AUTHOR_SELECT },
category: { select: { id: true, name: true, slug: true } },
},
}),
this.db.post.count({ where: { authorId, status: "PUBLISHED" } }),
]);
return { data, total };
}

async findByCategory(
categoryId: string,
page = 1,
limit = 10,
): Promise<{ data: Post[]; total: number }> {
const skip = (page - 1) \* limit;
const [data, total] = await Promise.all([
this.db.post.findMany({
where: { categoryId, status: "PUBLISHED" },
skip,
take: limit,
orderBy: { publishedAt: "desc" },
include: {
author: { select: AUTHOR_SELECT },
category: { select: { id: true, name: true, slug: true } },
},
}),
this.db.post.count({ where: { categoryId, status: "PUBLISHED" } }),
]);
return { data, total };
}

async findByTag(
tagId: string,
page = 1,
limit = 10,
): Promise<{ data: Post[]; total: number }> {
const skip = (page - 1) \* limit;
const where: Prisma.PostWhereInput = {
status: "PUBLISHED",
tags: { some: { tagId } },
};
const [data, total] = await Promise.all([
this.db.post.findMany({
where,
skip,
take: limit,
orderBy: { publishedAt: "desc" },
include: { author: { select: AUTHOR_SELECT } },
}),
this.db.post.count({ where }),
]);
return { data, total };
}

async getFeed(
userId?: string,
page = 1,
limit = 10,
): Promise<{ data: Post[]; total: number }> {
const skip = (page - 1) \* limit;
const where: Prisma.PostWhereInput = { status: "PUBLISHED" };

    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { select: AUTHOR_SELECT },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.db.post.count({ where }),
    ]);
    return { data, total };

}

async search(
query: string,
page = 1,
limit = 10,
): Promise<{ data: Post[]; total: number }> {
const skip = (page - 1) \* limit;
const where: Prisma.PostWhereInput = {
status: "PUBLISHED",
OR: [
{ title: { contains: query } },
{ content: { contains: query } },
{ excerpt: { contains: query } },
],
};

    const [data, total] = await Promise.all([
      this.db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: { author: { select: AUTHOR_SELECT } },
      }),
      this.db.post.count({ where }),
    ]);
    return { data, total };

}

async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
return this.db.post.update({ where: { id }, data });
}

async delete(id: string): Promise<Post> {
return this.db.post.delete({ where: { id } });
}

async incrementViews(id: string): Promise<void> {
await this.db.post.update({
where: { id },
data: { views: { increment: 1 } },
});
}

async incrementLikes(id: string): Promise<void> {
await this.db.post.update({
where: { id },
data: { likesCount: { increment: 1 } },
});
}

async decrementLikes(id: string): Promise<void> {
await this.db.post.update({
where: { id },
data: { likesCount: { decrement: 1 } },
});
}

async incrementComments(id: string): Promise<void> {
await this.db.post.update({
where: { id },
data: { commentsCount: { increment: 1 } },
});
}

async decrementComments(id: string): Promise<void> {
await this.db.post.update({
where: { id },
data: { commentsCount: { decrement: 1 } },
});
}

async incrementBookmarks(id: string): Promise<void> {
await this.db.post.update({
where: { id },
data: { bookmarksCount: { increment: 1 } },
});
}

async decrementBookmarks(id: string): Promise<void> {
await this.db.post.update({
where: { id },
data: { bookmarksCount: { decrement: 1 } },
});
}
}

]]>
</file>
<file name="lib\validation\schemas.ts">

<![CDATA[
// lib/validation/schemas.ts
import { z } from "zod";

// ============================
// PAGINATION
// ============================

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// ============================
// POSTS
// ============================

export const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const UpdatePostSchema = CreatePostSchema.partial();

// ============================
// PODCASTS
// ============================

export const CreatePodcastSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  audioUrl: z.string().url(),
  coverImage: z.string().url().optional(),
  duration: z.number().int().positive(),
  transcript: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const UpdatePodcastSchema = CreatePodcastSchema.partial();

// ============================
// BOOKS
// ============================

export const CreateBookSchema = z.object({
  title: z.string().min(3).max(200),
  synopsis: z.string().max(2000).optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const UpdateBookSchema = CreateBookSchema.partial();

export const CreateChapterSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  publishNow: z.boolean().default(false),
});

// ============================
// COMMENTS
// ============================

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const CreateReplySchema = CreateCommentSchema.extend({
  parentId: z.string().cuid(),
});

export const CommentTargetSchema = z.object({
  type: z.enum(["post", "podcast", "book"]),
  id: z.string().cuid(),
});

// ============================
// INTERACTIONS (Like / Bookmark polymorphes)
// ============================

const LikeableTypeSchema = z.enum(["post", "podcast", "book", "comment"]);
const BookmarkableTypeSchema = z.enum(["post", "podcast", "book"]);

export const LikeTargetSchema = z
  .object({ type: LikeableTypeSchema, id: z.string().cuid() })
  .or(z.object({ targetType: LikeableTypeSchema, targetId: z.string().cuid() }))
  .transform((value) =>
    "targetType" in value
      ? { type: value.targetType, id: value.targetId }
      : value,
  );

export const BookmarkTargetSchema = z
  .object({ type: BookmarkableTypeSchema, id: z.string().cuid() })
  .or(
    z.object({
      targetType: BookmarkableTypeSchema,
      targetId: z.string().cuid(),
    }),
  )
  .transform((value) =>
    "targetType" in value
      ? { type: value.targetType, id: value.targetId }
      : value,
  );

// ============================
// USERS / AUTH
// ============================

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// ============================
// CATEGORIES / TAGS (admin)
// ============================

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const CreateTagSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(300).optional(),
});

// ============================
// SEARCH
// ============================

export const SearchSchema = z.object({
  q: z.string().min(1),
  type: z
    .enum(["all", "posts", "podcasts", "books", "users", "tags"])
    .default("all"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

]]>
</file>
<file name="app\api\posts\route.ts">
<![CDATA[
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PostService } from "../../../lib/services/post.service";
import { getSession } from "../../../lib/auth/session";
import { CreatePostSchema, PaginationSchema } from "../../../lib/validation/schemas";
import { handleError } from "../../../lib/error-handler";

const postService = new PostService();

// GET /api/posts?page=&limit= -> Feed (Chapitre 3 : GET /feed)
export async function GET(req: NextRequest) {
try {
const session = await getSession();
const url = new URL(req.url);
const { page, limit } = PaginationSchema.parse({
page: url.searchParams.get("page") ?? undefined,
limit: url.searchParams.get("limit") ?? undefined,
});

    const result = await postService.getFeed(session?.user?.id, page, limit);

    return NextResponse.json({
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    });

} catch (error) {
return handleError(error);
}
}

// POST /api/posts -> Créer un article
export async function POST(req: NextRequest) {
try {
const session = await getSession();
if (!session) {
return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
}

    const body = await req.json();
    const validated = CreatePostSchema.parse(body);
    const post = await postService.createPost(session.user.id, validated);

    return NextResponse.json(post, { status: 201 });

} catch (error) {
return handleError(error);
}
}

]]>
</file>
<file name="app\api\me\route.ts">

<![CDATA[
// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "../../../lib/services/user.service";
import { UserRepository } from "../../../lib/repositories/user.repository";
import { getSession } from "../../../lib/auth/session";
import { UpdateProfileSchema } from "../../../lib/validation/schemas";
import { handleError } from "../../../lib/error-handler";
import { NotFoundException } from "../../../lib/exceptions";

const userService = new UserService();
const userRepository = new UserRepository();

// GET /api/me -> Mon profil
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await userRepository.findById(session.user.id);
    if (!user) throw new NotFoundException("Utilisateur non trouvé");

    const { password: _password, ...profile } = user;
    return NextResponse.json(profile);
  } catch (error) {
    return handleError(error);
  }
}

// PATCH /api/me -> Modifier mon profil
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const validated = UpdateProfileSchema.parse(body);

    const user = await userService.updateProfile(session.user.id, validated);
    const { password: _password, ...profile } = user;

    return NextResponse.json(profile);
  } catch (error) {
    return handleError(error);
  }
}

]]>
</file>
<file name="lib\services\user.service.ts">
<![CDATA[
// lib/services/user.service.ts
import { User } from "@/prisma/generated/client";
import { hash } from "bcrypt";
import { z } from "zod";
import { ConflictException, NotFoundException } from "../exceptions";
import { UserRepository } from "../repositories/user.repository";
import { RegisterSchema, UpdateProfileSchema } from "../validation/schemas";

export class UserService {
private userRepository = new UserRepository();

async register(data: z.infer<typeof RegisterSchema>): Promise<User> {
const existingEmail = await this.userRepository.findByEmail(data.email);
if (existingEmail)
throw new ConflictException("Cet email est déjà utilisé");

    const existingUsername = await this.userRepository.findByUsername(
      data.username,
    );
    if (existingUsername)
      throw new ConflictException("Ce nom d'utilisateur est déjà pris");

    const hashedPassword = await hash(data.password, 10);

    return this.userRepository.create({
      email: data.email,
      username: data.username,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

}

async getProfile(username: string): Promise<User> {
const user = await this.userRepository.findByUsername(username);
if (!user) throw new NotFoundException("Utilisateur non trouvé");
return user;
}

async updateProfile(
userId: string,
data: z.infer<typeof UpdateProfileSchema>,
): Promise<User> {
const user = await this.userRepository.findById(userId);
if (!user) throw new NotFoundException("Utilisateur non trouvé");
return this.userRepository.update(userId, data);
}
}

]]>
</file>
<file name="lib\repositories\user.repository.ts">

<![CDATA[
// lib/repositories/user.repository.ts
import { Prisma, PrismaClient, User } from "@/prisma/generated/client";
import { prisma } from "../prisma/client";

export class UserRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { username } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }
}

]]>
</file>
<file name="app\profile\[username]\page.tsx">
<![CDATA[
// app/profile/[username]/page.tsx
"use client";

import OptimizedImage from "@/components/ui/OptimizedImage";
import { useAuthorPosts } from "@/hooks/blog/useAuthorPosts";
import { AnimatePresence, motion } from "framer-motion";
import {
Camera,
Check,
Edit3,
Image as ImageIcon,
Mail,
Trash2,
User,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Types
interface ArticleCardProps {
article: any;
isDraft?: boolean;
onDelete?: (id: string) => void;
onEdit?: (id: string) => void;
onLike?: (id: string) => void;
onBookmark?: (id: string) => void;
isLiked?: boolean;
isBookmarked?: boolean;
likeCount?: number;
}

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

// Couleur par catégorie
const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
Développement: { bg: "#EEEDFE", text: "#3C3489" },
Voyage: { bg: "#FAECE7", text: "#712B13" },
default: { bg: "#F1EFE8", text: "#444441" },
};

const TABS = [
{ key: "articles", label: "Articles" },
{ key: "brouillons", label: "Brouillons" },
{ key: "personnaliser", label: "Personnaliser" },
];

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

function ArticleCard({
article,
isDraft = false,
onDelete,
onEdit,
onLike,
onBookmark,
isLiked = false,
isBookmarked = false,
likeCount = 0,
}: ArticleCardProps) {
const category = article?.category || "default";
const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.default;

return (
<motion.div
layout
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.96 }}
transition={{ duration: 0.2 }}
className="rounded-xl overflow-hidden bg-gray-50 hover:shadow-md transition-shadow" >

<div className="h-28 sm:h-32 bg-gray-100 flex items-center justify-center relative">
{article?.coverImage ? (
<OptimizedImage
src={article.coverImage}
alt={article.title || "Article"}
width={300}
height={128}
className="w-full h-full object-cover"
/>
) : (
<ImageIcon size={22} className="text-gray-400" />
)}
{isDraft && (
<span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
Brouillon
</span>
)}
</div>
<div className="p-3.5 sm:p-4">
<div className="flex items-center gap-2 mb-2.5 flex-wrap">
<span
className="inline-block text-[11px] px-2.5 py-1 rounded-full"
style={{ background: style.bg, color: style.text }} >
{category}
</span>
<span className="text-xs text-gray-400">
{article?.readTime || "-- min"}
</span>
</div>
<p className="font-serif text-[15px] sm:text-base leading-snug mb-1.5 line-clamp-2">
{article?.title || "Sans titre"}
</p>
<p className="text-xs text-gray-400 mb-3.5">{article?.date || ""}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(article?.id)}
              className="flex items-center gap-1 text-[11px] border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-white transition"
            >
              <Edit3 size={12} />
              Modifier
            </button>
            <button
              onClick={() => onDelete?.(article?.id)}
              className="flex items-center text-[11px] border border-red-200 text-red-600 rounded-lg px-2 py-1.5 hover:bg-red-50 transition"
            >
              <Trash2 size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onLike && (
              <button
                onClick={() => onLike(article?.id)}
                className={`flex items-center gap-1 text-[11px] ${
                  isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                } transition`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{likeCount || 0}</span>
              </button>
            )}
            {onBookmark && (
              <button
                onClick={() => onBookmark(article?.id)}
                className={`text-[11px] ${
                  isBookmarked
                    ? "text-blue-500"
                    : "text-gray-400 hover:text-blue-500"
                } transition`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>

);
}

export default function AuthorPage() {
const params = useParams();
const username = useMemo(
() => decodeURIComponent(params?.username as string),
[params?.username],
);

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

// États locaux pour la gestion des articles
const [activeTab, setActiveTab] = useState("articles");
const [savedNotice, setSavedNotice] = useState(false);
const [localArticles, setLocalArticles] = useState<any[]>([]);
const [localDrafts, setLocalDrafts] = useState<any[]>([]);

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
(item: FeedItem) => item.post?.status === "published",
);
const drafts = posts.filter(
(item: FeedItem) => item.post?.status === "draft",
);
setLocalArticles(published);
setLocalDrafts(drafts);
}
}, [posts]);

// --- États de chargement et d'erreur ---
if (isLoading) {
return (

<div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
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
{[...Array(4)].map((\_, i) => (
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

<div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
{/_ Barre du haut _/}
<div className="flex items-center justify-between mb-2 gap-2">
<p className="font-serif text-lg sm:text-xl truncate">Le Journal</p>
<button
          onClick={refresh}
          aria-label="Rafraîchir"
          className="p-2 rounded-full hover:bg-gray-50 transition-colors"
        >
<motion.svg
animate={{ rotate: isRefreshing ? 360 : 0 }}
transition={{ duration: 0.6, ease: "linear" }}
className="h-5 w-5 text-gray-400"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
strokeWidth={1.5} >
<path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
</motion.svg>
</button>
</div>

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
                <ArticleCard
                  key={item.post.id}
                  article={item.post}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  onLike={() => toggleLike(item.post.id)}
                  onBookmark={() => toggleBookmark(item.post.id)}
                  isLiked={item.isLiked}
                  isBookmarked={item.isBookmarked}
                  likeCount={item.post.likeCount}
                />
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
                <ArticleCard
                  key={item.post.id}
                  article={item.post}
                  isDraft={true}
                  onDelete={() => {}}
                  onEdit={() => {}}
                  onLike={() => toggleLike(item.post.id)}
                  onBookmark={() => toggleBookmark(item.post.id)}
                  isLiked={item.isLiked}
                  isBookmarked={item.isBookmarked}
                  likeCount={item.post.likeCount}
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

]]>
</file>
<file name="components\ui\button.tsx">

<![CDATA[

]]>
</file>
<file name="components\ui\Card.tsx">
<![CDATA[
// components/ui/Card.tsx
"use client";
import { useInteractions } from "@/hooks/useInteractions";
import { FeedItem } from "@/lib/services/feed.service";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bookmark, Heart, MessageCircle, UserCheck } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "./OptimizedImage";

interface CardProps {
post?: FeedItem;
isLoading?: boolean;
currentUserId?: string;
}

export default function Card({
post,
isLoading = false,
currentUserId,
}: CardProps) {
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
<div className="w-full aspect-4/3 bg-neutral-800/60" />
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

if (!post) {
return (

<section className="h-full rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] min-h-75 flex items-center justify-center">
<p className="text-neutral-500 text-sm">Aucun article à afficher</p>
</section>
);
}

const { post: postData, author, interactionState } = post;
const publishedDate = postData.publishedAt
? format(new Date(postData.publishedAt), "dd MMMM yyyy", { locale: fr })
: "Date non disponible";

const {
isLiked,
isBookmarked,
isFollowing,
likesCount,
isLiking,
isBookmarking,
isFollowingAction,
toggleLike,
toggleBookmark,
toggleFollow,
canFollow,
} = useInteractions({
targetId: postData.id,
targetType: "post",
authorId: author.id,
authorUsername: author.username,
currentUserId,
initialLiked: interactionState?.isLiked || false,
initialBookmarked: interactionState?.isBookmarked || false,
initialFollowing: interactionState?.isFollowing || false,
initialLikesCount: postData.likesCount || 0,
});

return (

<article className="group/card h-full flex flex-col rounded-3xl border border-neutral-800/80 bg-[#1b1b1b] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] hover:border-neutral-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 overflow-hidden">
{/_ Header - glassmorphism léger _/}
<div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 bg-white/[0.02] backdrop-blur-sm p-4">
<Link
href={`/@${author.username}`}
className="flex flex-wrap items-center gap-2 hover:opacity-80 transition-opacity min-w-0" >
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

        {canFollow && (
          <button
            onClick={toggleFollow}
            disabled={isFollowingAction}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 shrink-0 active:scale-95 ${
              isFollowing
                ? "bg-neutral-800 text-white hover:bg-neutral-700 ring-1 ring-white/10"
                : "bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 ring-1 ring-blue-500/20"
            } ${isFollowingAction ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-3.5 w-3.5" />
                <span>Suivi</span>
              </>
            ) : (
              <span>Suivre</span>
            )}
          </button>
        )}
      </div>

      {/* Content - image avec dégradé de lisibilité */}
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <Link
          href={`/post/${postData.slug}`}
          className="block group h-full w-full"
        >
          {postData.coverOptimizedImage ? (
            <OptimizedImage
              src={postData.coverOptimizedImage}
              alt={postData.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-neutral-800 to-neutral-900" />
          )}
          {/* dégradé bas pour lisibilité future */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {postData.category && (
          <Link
            href={`/category/${postData.category.slug}`}
            className="absolute top-3 left-3 z-10 text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full hover:bg-black/70 hover:border-white/25 transition-colors"
          >
            {postData.category.name}
          </Link>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 p-4 mt-auto">
        <Link href={`/post/${postData.slug}`}>
          <h2 className="text-white font-semibold text-[15px] leading-snug hover:text-blue-400 transition-colors line-clamp-2">
            {postData.title}
          </h2>
        </Link>

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
              href={`/post/${postData.slug}#comments`}
              className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm tabular-nums">
                {postData.commentsCount || 0}
              </span>
            </Link>
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
      </div>
    </article>

);
}

]]>
</file>
<file name="components\ui\OptimizedImage.tsx">

<![CDATA[
// components/ui/OptimizedImage.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  className = "",
  width,
  height,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // Utiliser une image de fallback si l'image principale échoue
  const fallbackImage = "/images/fallback-cover.jpg";

  if (error) {
    return (
      <div className={`bg-neutral-800 ${className}`}>
        <Image
          src={fallbackImage}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      loading="lazy"
      // Ajouter un timeout pour les images
      onLoadingComplete={(result) => {
        if (result.naturalWidth === 0) {
          setError(true);
        }
      }}
    />
  );
}

]]>
</file>
<file name="app\post\page.tsx">
<![CDATA[
// app/post/page.tsx
"use client";

import { usePost } from "@/hooks/blog/usePost";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Checklist from "@/components/blog/create/Checklist";
import CoverImageUpload from "@/components/blog/create/CoverImageUpload";
import TagInput from "@/components/blog/create/TagInput";
import Toolbar from "@/components/blog/create/Toolbar";
import { useImageUpload } from "@/hooks/blog/useImageUpload";

export default function CreatePostPage() {
const router = useRouter();

// Utiliser notre hook personnalisé
const {
formData,
updateField,
handleSubmit,
isSubmitting,
categories,
tags,
isValid,
errors,
resetForm,
hasAttemptedSubmit,
} = usePost({
onSuccess: (post) => {
console.log("Post créé avec succès:", post);
setShowSuccessModal(true);
window.setTimeout(() => {
router.push("/home");
}, 1600);
},
onError: (error) => {
console.error("Erreur lors de la création du post:", error);
},
});

// États UI
const [isTitleFocused, setIsTitleFocused] = useState(false);
const [editorFocused, setEditorFocused] = useState(false);
const [excerptFocused, setExcerptFocused] = useState(false);
const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
const [isMobile, setIsMobile] = useState(false);
const [isCreatingTag, setIsCreatingTag] = useState(false);
const [isCreatingCategory, setIsCreatingCategory] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);
const {
uploadImage,
deleteImage,
isUploading,
progress,
error: uploadError,
} = useImageUpload();
const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

// Détection mobile
useEffect(() => {
const checkMobile = () => setIsMobile(window.innerWidth < 640);
checkMobile();
window.addEventListener("resize", checkMobile);
return () => window.removeEventListener("resize", checkMobile);
}, []);

// Gestionnaire d'upload
const handleImageUpload = async (file: File) => {
const imageUrl = await uploadImage(file);
if (imageUrl) {
updateField("cover_image", imageUrl);
}
};

// Gestionnaire de suppression
const handleImageRemove = async () => {
updateField("cover_image", "");
};

const handleUrlChange = (url: string) => {
updateField("cover_image", url);
};

// Insertion de texte dans l'éditeur
const insertText = (before: string, after: string = "") => {
const textarea = contentTextareaRef.current;
if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || "";
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      before +
      selectedText +
      after +
      text.substring(end);
    updateField("content", newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);

};

// Gestion des tags avec création automatique
const handleTagAdd = async (tagName: string) => {
if (!tagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const newTag = await tags.createAndSelectTag(tagName.trim());

      if (newTag) {
        // Ajouter le tag à la sélection
        const newTagIds = [...(formData.tag_ids || []), newTag.id];
        updateField("tag_ids", newTagIds);
        toast.success(`Tag "${tagName}" ajouté`);
      } else {
        toast.error(`Impossible d'ajouter le tag "${tagName}"`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du tag:", error);
      toast.error(`Erreur lors de l'ajout du tag "${tagName}"`);
    } finally {
      setIsCreatingTag(false);
    }

};

const handleTagRemove = (tagName: string) => {
const tag = tags.getTagByName(tagName);
if (tag) {
const newTagIds = (formData.tag_ids || []).filter((id) => id !== tag.id);
updateField("tag_ids", newTagIds);
toast.success(`Tag "${tagName}" retiré`);
}
};

// Gestion des catégories avec création automatique
const handleCategoryAdd = async (categoryName: string) => {
if (!categoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const newCategory = await categories.createAndSelectCategory(
        categoryName.trim(),
      );

      if (newCategory) {
        updateField("category_id", String(newCategory.id));
        toast.success(`Catégorie "${categoryName}" ajoutée`);
      } else {
        toast.error(`Impossible d'ajouter la catégorie "${categoryName}"`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      toast.error(`Erreur lors de l'ajout de la catégorie "${categoryName}"`);
    } finally {
      setIsCreatingCategory(false);
    }

};

// Gestion de la suppression de la catégorie
const handleCategoryRemove = (categoryName: string) => {
// On vérifie que la catégorie actuelle correspond au nom
const currentCategory = categories.getCategoryById(formData.category_id);
if (currentCategory?.name === categoryName) {
updateField("category_id", "");
toast.success(`Catégorie "${categoryName}" retirée`);
}
};

// Checklist items
const checklistItems = [
{ key: "title", label: "Titre défini", done: !!formData.title?.trim() },
{
key: "content",
label: "Contenu rédigé",
done: !!formData.content?.trim(),
},
{
key: "excerpt",
label: "Extrait ajouté",
done: !!formData.excerpt?.trim(),
},
{
key: "cover",
label: "Image de couverture",
done: !!formData.cover_image,
},
{
key: "category",
label: "Catégorie sélectionnée",
done: Boolean(formData.category_id),
},
{
key: "tags",
label: "Tag(s) sélectionnés",
done: (formData.tag_ids?.length ?? 0) > 0,
},
];

const completedCount = checklistItems.filter((item) => item.done).length;
const totalCount = checklistItems.length;
const progressPercentage = (completedCount / totalCount) \* 100;

// Prévisualisation
const previewContent = (formData.content || "")
.replace(/\*\*(._?)\*\*/g, "<strong>$1</strong>")
.replace(/\*(._?)\*/g, "<em>$1</em>")
.replace(/\n/g, "<br/>");

// Récupérer le nom de la catégorie sélectionnée
const selectedCategoryName = formData.category_id
? categories.getCategoryName(formData.category_id)
: "";

return (
<ProtectedRoute fallback={<div className="min-h-screen" />}>

<main style={{ backgroundColor: "var(--bg-primary)" }}>
<AnimatePresence>
{showSuccessModal && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" >
<motion.div
initial={{ scale: 0.8, y: 20, opacity: 0 }}
animate={{ scale: 1, y: 0, opacity: 1 }}
exit={{ scale: 0.9, y: 10, opacity: 0 }}
transition={{ duration: 0.35, ease: "easeOut" }}
className="w-full max-w-sm rounded-3xl border border-white/10 bg-(--bg-secondary) p-8 text-center shadow-2xl" >
<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1, rotate: 360 }}
transition={{ duration: 0.5, ease: "easeOut" }}
className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15" >
<Check className="h-8 w-8 text-emerald-500" />
</motion.div>

                <h2 className="text-xl font-semibold text-(--text-primary)">
                  Succès !
                </h2>
                <p className="mt-2 text-sm text-(--text-secondary)">
                  Votre article a bien été créé et vous allez être redirigé vers
                  l’accueil.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-full mx-auto">
          {/* CHECKLIST MOBILE */}
          {isMobile && (
            <div
              className="sticky top-0 z-10 -mx-4 px-4 py-3 border-b"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border)",
              }}
            >
              <Checklist
                items={checklistItems}
                completedCount={completedCount}
                totalCount={totalCount}
                progressPercentage={progressPercentage}
                isMobile={true}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-2 lg:mt-3">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Colonne principale */}
              <div className="flex-1 order-2 lg:order-1 space-y-6">
                {/* Titre */}
                <div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                    className="w-full rounded-xl px-2 py-4 text-2xl sm:text-3xl font-light placeholder:font-light outline-none transition-all duration-200"
                    placeholder="Titre de l'article..."
                    onFocus={() => setIsTitleFocused(true)}
                    onBlur={() => setIsTitleFocused(false)}
                    style={{
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                      borderWidth: isTitleFocused ? "2px" : "1px",
                    }}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm" style={{ color: "#DC2626" }}>
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Éditeur */}
                <div
                  className="border rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    borderColor: "var(--border)",
                    borderWidth: editorFocused ? "2px" : "1px",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-3 border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Toolbar onInsertText={insertText} />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab("write")}
                        className="px-3 py-1.5 text-xs rounded transition-colors"
                        style={{
                          color:
                            activeTab === "write"
                              ? "var(--text-primary)"
                              : "var(--text-tertiary)",
                          backgroundColor:
                            activeTab === "write"
                              ? "var(--bg-tertiary)"
                              : "transparent",
                        }}
                      >
                        Écrire
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className="px-3 py-1.5 text-xs rounded transition-colors"
                        style={{
                          color:
                            activeTab === "preview"
                              ? "var(--text-primary)"
                              : "var(--text-tertiary)",
                          backgroundColor:
                            activeTab === "preview"
                              ? "var(--bg-tertiary)"
                              : "transparent",
                        }}
                      >
                        Aperçu
                      </button>
                    </div>
                  </div>

                  {activeTab === "write" ? (
                    <textarea
                      ref={contentTextareaRef}
                      value={formData.content}
                      onChange={(e) => updateField("content", e.target.value)}
                      required
                      rows={14}
                      className="w-full px-4 py-4 border-none focus:ring-0 font-mono text-sm resize-none outline-none"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Commencez à écrire..."
                      onFocus={() => setEditorFocused(true)}
                      onBlur={() => setEditorFocused(false)}
                    />
                  ) : (
                    <div
                      className="p-6 prose prose-sm max-w-none"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {previewContent ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: previewContent }}
                        />
                      ) : (
                        <p style={{ color: "var(--text-tertiary)" }}>
                          Rien à prévisualiser. Commencez à écrire !
                        </p>
                      )}
                    </div>
                  )}
                  {errors.content && (
                    <p
                      className="px-4 pb-2 text-sm"
                      style={{ color: "#DC2626" }}
                    >
                      {errors.content}
                    </p>
                  )}
                </div>

                {/* Extrait */}
                <div
                  className="border rounded-xl p-4 transition-all duration-200"
                  style={{ borderColor: "var(--border)" }}
                >
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Extrait
                  </label>
                  <textarea
                    value={formData.excerpt || ""}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-xl resize-none focus:ring-0 outline-none transition-all duration-200"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                      borderWidth: excerptFocused ? "2px" : "1px",
                    }}
                    onFocus={() => setExcerptFocused(true)}
                    onBlur={() => setExcerptFocused(false)}
                    placeholder="Un résumé captivant..."
                  />
                  <div className="flex justify-between mt-2">
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {formData.excerpt?.length || 0}/160 caractères
                    </p>
                    {errors.excerpt && (
                      <p className="text-xs" style={{ color: "#DC2626" }}>
                        {errors.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image de couverture */}
                <div
                  className="border p-4 rounded-xl"
                  style={{ borderColor: "var(--border)" }}
                >
                  <CoverImageUpload
                    cover_image={formData.cover_image || ""}
                    isUploading={isUploading}
                    uploadProgress={progress}
                    uploadError={uploadError}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    onUrlChange={handleUrlChange}
                    onDeleteImage={deleteImage}
                    maxSize={5}
                  />
                </div>

                {/* Catégories et Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TagInput
                    label="Catégorie"
                    items={selectedCategoryName ? [selectedCategoryName] : []}
                    placeholder="Ajouter une catégorie..."
                    onAdd={handleCategoryAdd}
                    onRemove={handleCategoryRemove}
                    availableItems={categories.categoryNames}
                    tagColor="blue"
                    disabled={isCreatingCategory || categories.isCreating}
                    isCreating={isCreatingCategory || categories.isCreating}
                    maxTags={1}
                  />

                  {/* Tags */}
                  <TagInput
                    label="Tags"
                    items={tags.tagNames.filter((name) =>
                      formData.tag_ids?.some(
                        (id) => tags.getTagByName(name)?.id === id,
                      ),
                    )}
                    placeholder="Ajouter un tag..."
                    onAdd={handleTagAdd}
                    onRemove={handleTagRemove}
                    availableItems={tags.tagNames}
                    tagColor="blue"
                    disabled={isCreatingTag || tags.isCreating}
                    isCreating={isCreatingTag || tags.isCreating}
                    maxTags={10}
                  />
                </div>
                <div className="w-full flex flex-row gap-2">
                  {/* Bloc Statut avec toggle - Prend 50% de la largeur */}
                  <div className="flex-1">
                    <div
                      className="border rounded-xl p-3 transition-all duration-300 h-full flex items-center"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p
                            className="text-sm font-medium transition-all duration-300"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {formData.published
                              ? "Visible par tous"
                              : "Brouillon"}
                          </p>
                          <p
                            className="text-xs transition-all duration-300"
                            style={{
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {formData.published ? "● Publié" : "● Non publié"}
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.published}
                            onChange={(e) =>
                              updateField("published", e.target.checked)
                            }
                          />
                          <div
                            className={`
              relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out
              ${formData.published ? "bg-(--accent)" : "bg-(--border)"}
              after:content-[''] after:absolute after:top-0.5 after:left-0.5
              after:bg-white after:rounded-full after:h-5 after:w-5
              after:transition-all after:duration-300 after:ease-in-out
              ${
                formData.published
                  ? "after:translate-x-5 after:shadow-md"
                  : "after:translate-x-0 after:shadow-sm"
              }
              hover:scale-105
            `}
                            style={{
                              backgroundColor: formData.published
                                ? "var(--accent)"
                                : "var(--border)",
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit - Prend 50% de la largeur */}
                  <div className="flex-1">
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !isValid ||
                        isCreatingTag ||
                        isCreatingCategory ||
                        tags.isCreating ||
                        categories.isCreating
                      }
                      className="w-full py-2 text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-full"
                      style={{
                        backgroundColor: "var(--accent)",
                        color: "var(--text-primary)",
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !isSubmitting &&
                          !isCreatingTag &&
                          !isCreatingCategory
                        ) {
                          e.currentTarget.style.opacity = "0.85";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {formData.published
                            ? "Publication en cours..."
                            : "Enregistrement en cours..."}
                        </>
                      ) : isCreatingCategory ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Création de la catégorie...
                        </>
                      ) : isCreatingTag || tags.isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Création des tags...
                        </>
                      ) : formData.published ? (
                        "Publier l'article"
                      ) : (
                        "Enregistrer comme brouillon"
                      )}
                    </button>
                    {errors.submit && (
                      <p
                        className="mt-2 text-sm text-center"
                        style={{ color: "#DC2626" }}
                      >
                        {errors.submit}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              {!isMobile && (
                <aside className="order-1 lg:order-2 w-full lg:w-72 xl:w-80 shrink-0">
                  <div className="lg:sticky lg:top-24 space-y-4">
                    <Checklist
                      items={checklistItems}
                      completedCount={completedCount}
                      totalCount={totalCount}
                      progressPercentage={progressPercentage}
                      isMobile={false}
                    />

                    {/* Résumé des sélections */}
                    <div
                      className="border rounded-xl p-4"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <h4
                        className="text-sm font-medium mb-3"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Résumé
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: "var(--text-tertiary)" }}>
                            Catégorie
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {selectedCategoryName || "Aucune"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "var(--text-tertiary)" }}>
                            Tags
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {formData.tag_ids && formData.tag_ids.length > 0
                              ? formData.tag_ids
                                  .map((id) => tags.getTagById(id)?.name || "")
                                  .filter(Boolean)
                                  .join(", ")
                              : "Aucun"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "var(--text-tertiary)" }}>
                            Statut
                          </span>
                          <span style={{ color: "var(--text-secondary)" }}>
                            {formData.published ? "Publié" : "Brouillon"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>

);
}

]]>
</file>
<file name="app\post\[slug]\page.tsx">

<![CDATA[
// app/blog/[slug]/page.tsx (version corrigée)
"use client";

import { ArticleView } from "@/components/blog/feed/article";
import { useAuthContext } from "@/contexts/auth/auth.context";
import { usePostDetail } from "@/hooks/blog/usePostDetail";
import { motion } from "framer-motion";
import { BouncyArc } from "ldrs/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const slug = params.slug as string;

  // État local pour le formulaire de commentaire
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  // Utilisation du hook
  const {
    post,
    author,
    comments,
    isLoading,
    isError,
    error,
    isLiked,
    isBookmarked,
    likesCount,
    isLiking,
    isBookmarking,
    isSubmittingComment,
    toggleLike,
    toggleBookmark,
    submitComment,
    deleteComment,
    canInteract,
    isOwnContent,
    reload,
  } = usePostDetail(slug, {
    fetchComments: true,
    commentsLimit: 20,
    onError: (err) => {
      console.error("Erreur dans usePostDetail:", err);
    },
  });

  // Redirection si l'article n'existe pas
  useEffect(() => {
    if (!isLoading && !post && !isError) {
      toast.error("Article non trouvé");
      router.push("/blog");
    }
  }, [post, isLoading, router, isError]);

  // Adaptation des données pour l'UI ArticleView
  const adaptedPost = useMemo(() => {
    if (!post) return null;

    const authorDisplayName = author
      ? [author.firstName, author.lastName].filter(Boolean).join(" ") ||
        author.username ||
        author.id
      : post.authorId || "Utilisateur";

    const authorInitial =
      author?.firstName?.[0] ||
      author?.lastName?.[0] ||
      author?.username?.[0] ||
      post.authorId?.[0] ||
      "U";

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      imageUrl: post.coverImage || "/blog/placeholder.jpg",
      category: post.category?.name || "Non catégorisé",
      authorId: post.authorId,
      authorName: authorDisplayName,
      authorRole: author?.bio || "Auteur",
      authorAvatar:
        author?.avatar ||
        `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(authorInitial)}`,
      date: new Date(post.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      readingTime: `${Math.ceil((post.content?.length || 0) / 1000)} min`,
      likesCount: likesCount,
      tags: post.tags.map((tag) => tag.name).filter(Boolean),
    };
  }, [post, author, likesCount]);

  // Adaptation des commentaires pour l'UI
  const adaptedComments = useMemo(() => {
    if (!comments) return [];
    return comments.map((comment) => ({
      id: comment.id,
      text: comment.content,
      authorName:
        [comment.author.firstName, comment.author.lastName]
          .filter(Boolean)
          .join(" ") || comment.author.username,
      authorAvatar:
        comment.author.avatar ||
        `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(comment.author.username?.[0] || "U")}`,
      postId: post?.id || "",
      approved: true,
      createdAt: comment.createdAt,
    }));
  }, [comments, post?.id]);

  // ✅ CORRECTION: Créer des tableaux typés string[] sans undefined
  const likedPosts: string[] = useMemo(() => {
    if (isLiked && post) {
      return [post.id];
    }
    return [];
  }, [isLiked, post]);

  const savedPosts: string[] = useMemo(() => {
    if (isBookmarked && post) {
      return [post.id];
    }
    return [];
  }, [isBookmarked, post]);

  // Gestionnaire de soumission de commentaire
  const handleCommentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    // Si l'utilisateur n'est pas connecté, utiliser le nom saisi
    if (!canInteract) {
      toast.error("Connectez-vous pour commenter");
      router.push("/login");
      return;
    }

    const result = await submitComment(commentText);
    if (result) {
      setCommentText("");
      setCommentAuthor("");
    }
  };

  // Gestionnaire pour le like
  const handleLikePost = async (postId: string) => {
    await toggleLike();
  };

  // Gestionnaire pour la sauvegarde
  const handleSavePost = (postId: string) => {
    toggleBookmark();
  };

  // Gestionnaire pour les réactions
  const handleToggleReaction = (postId: string, reactionId: string) => {
    // Implémentation pour les réactions si nécessaire
  };

  // Gestionnaire pour changer la vue
  const setActiveView = (view: "feed" | "article" | "author" | "admin") => {
    if (view === "feed") {
      router.push("/blog");
    } else if (view === "author" && post) {
      router.push(`/blog/author/${post.authorId}`);
    }
  };

  // Gestionnaire pour sélectionner un auteur
  const setSelectedAuthorId = (id: string | null) => {
    if (id) {
      router.push(`/blog/author/${id}`);
    }
  };

  // Gestionnaire pour supprimer un commentaire
  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  // Gestion des erreurs
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
            Article introuvable
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {error?.message ||
              "L'article que vous recherchez n'existe pas ou a été supprimé."}
          </p>
          <button
            onClick={() => router.push("/blog")}
            className="px-6 py-2 text-sm font-medium rounded-xl transition-opacity"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Retour au blog
          </button>
        </div>
      </div>
    );
  }

  // État de chargement
  if (isLoading || !adaptedPost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-950/20 via-transparent to-blue-950/10">
        <BouncyArc size="90" speed="1.65" color="blue" />

        <p className="text-sm font-light text-blue-300/80 tracking-[0.2em] ">
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
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <ArticleView
        activePost={adaptedPost}
        // ✅ Utilisation des tableaux typés correctement
        likedPosts={likedPosts}
        savedPosts={savedPosts}
        comments={adaptedComments}
        userReactions={{}}
        commentAuthor={commentAuthor}
        setCommentAuthor={setCommentAuthor}
        commentText={commentText}
        setCommentText={setCommentText}
        isSubmittingComment={isSubmittingComment}
        activeProfile={
          user
            ? {
                name:
                  [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  user.username,
                avatar:
                  user.avatar ||
                  `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${user.username?.[0] || "U"}`,
                roleLabel: user.role === "ADMIN" ? "Admin" : "Blogger",
              }
            : null
        }
        handleLikePost={handleLikePost}
        handleSavePost={handleSavePost}
        handleToggleReaction={handleToggleReaction}
        handleCommentFormSubmit={handleCommentFormSubmit}
        setActiveView={setActiveView}
        setSelectedAuthorId={setSelectedAuthorId}
        setAdminTab={(tab) => {
          console.log("Admin tab:", tab);
        }}
      />

      {/* Bouton de rafraîchissement */}
      <div className="max-w-4xl mx-auto mt-4 flex justify-end">
        <button
          onClick={reload}
          className="text-xs text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
        >
          ↻ Rafraîchir
        </button>
      </div>
    </motion.div>
  );
}

]]>
</file>
</files>
