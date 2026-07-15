// components/blog/feed/PostCard.tsx
import ProductImage from "@/components/ProductImage";
import { category_response } from "@/types/blog/category.types";
import { user_response } from "@/types/blog/user.types";
import { Bookmark, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Définir les types localement ou les exporter depuis un fichier central
export interface PostWithAuthor {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  category?: category_response | string;
  categories?: { category: category_response }[];
  author?: user_response;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  imageUrl?: string;
  cover_image?: string | null;
  _count?: {
    likes?: number;
    comments?: number;
  };
  created_at?: string | Date;
  published_at?: string | Date | null;
  slug?: string;
}

interface PostCardProps {
  post: PostWithAuthor;
  variant?: "grid" | "row" | "hero";
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: (postId: string) => void; // Ajouté
  onSave?: (postId: string) => void; // Ajouté
  onFollow?: (authorId: string) => void; // Ajouté
  onViewPost?: (postId: string) => void; // Ajouté
  onViewAuthor?: (authorId: string) => void; // Ajouté
}

// Helper pour obtenir le nom de l'auteur
const getAuthorName = (
  author: user_response | undefined,
  post: PostWithAuthor,
): string => {
  if (author) {
    if (author.first_name && author.last_name) {
      return `${author.first_name} ${author.last_name}`;
    }
    if (author.first_name) return author.first_name;
    if (author.email) return author.email.split("@")[0];
  }
  if (post.authorName) return post.authorName;
  return "Anonyme";
};

// Helper pour obtenir l'avatar
const getAuthorAvatar = (
  author: user_response | undefined,
  post: PostWithAuthor,
): string => {
  if (author?.image) return author.image;
  if (post.authorAvatar) return post.authorAvatar;
  const name = getAuthorName(author, post);
  return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${name[0] ?? "U"}`;
};

export default function PostCard({
  post,
  commentsCount = 0,
  isLiked = false,
  isSaved = false,
  onLike,
  onSave,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  // Gestion des valeurs par défaut
  const createdAt =
    post.created_at ?? post.published_at ?? new Date().toISOString();
  const cover_image =
    post.cover_image ?? post.imageUrl ?? "https://picsum.photos/400/400";
  const authorName = getAuthorName(post.author, post);
  const authorAvatar = getAuthorAvatar(post.author, post);
  const categories =
    post.categories ??
    (typeof post.category === "string"
      ? [
          {
            category: {
              id: "0",
              name: post.category,
              slug: post.category.toLowerCase(),
            },
          },
        ]
      : post.category
        ? [{ category: post.category }]
        : []);
  const likesCount =
    (post._count?.likes ?? 0) +
    (liked ? (isLiked ? 0 : 1) : (isLiked ? -1 : 0));
  const displayCommentsCount = post._count?.comments ?? commentsCount;
  const postHref = `/blog/${post.slug ?? post.id}`;

  return (
    <article
      className="group rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div
          className="relative md:w-2/5 aspect-square md:aspect-auto overflow-hidden"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <a
            href={postHref}
            className="absolute inset-0 z-20"
            aria-label={`Voir l'article ${post.title}`}
          />
          <ProductImage
            src={cover_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Badge catégorie */}
          <span
            className="absolute left-3 top-3 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full border"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              borderColor: "var(--border)",
            }}
          >
            {categories[0]?.category.name ?? "Tendance"}
          </span>
        </div>

        {/* Contenu */}
        <div className="flex-1 p-4 md:p-5 flex flex-col">
          {/* En-tête avec avatar + auteur */}
          <div className="flex items-center gap-3">
            <Image
              src={authorAvatar}
              alt={authorName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover ring-2"
              style={{ ringColor: "var(--border)" }}
            />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {authorName}
              </p>
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                <span>
                  {new Date(createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="hidden md:inline-flex items-center gap-1">
                  <Eye className="w-3 h-3" /> 1.2k
                </span>
              </div>
            </div>
          </div>

          {/* Titre */}
          <h3 className="mt-3 text-lg md:text-xl font-bold leading-tight">
            <a
              href={postHref}
              className="transition"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
              }}
            >
              {post.title}
            </a>
          </h3>

          {/* Extrait */}
          <p
            className="mt-2 text-sm line-clamp-2 md:line-clamp-3"
            style={{ color: "var(--text-secondary)" }}
          >
            {post.excerpt ?? post.content.slice(0, 100)}
          </p>

          {/* Tags */}
          <div className="hidden md:flex flex-wrap gap-2 mt-3">
            {categories
              .slice(0, 2)
              .map((cat: { category: category_response }, index: number) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  #{cat.category.name}
                </span>
              ))}
          </div>

          {/* Actions sociales */}
          <div
            className="flex items-center justify-between mt-4 pt-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex gap-4 md:gap-5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLiked(!liked);
                  onLike?.(post.id);
                }}
                className="flex items-center gap-1 transition"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Like"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <Heart
                  className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
                />
                <span className="text-sm">{likesCount}</span>
              </button>
              <button
                className="flex items-center gap-1 transition"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Comment"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{displayCommentsCount}</span>
              </button>
              <button
                className="transition"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Share"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSaved(!saved);
                onSave?.(post.id);
              }}
              className="transition"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Save"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <Bookmark
                className={`w-5 h-5 ${saved ? "fill-(--accent) text-(--accent)" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <article
      className="group rounded-2xl shadow-sm transition-all duration-300 overflow-hidden border animate-pulse"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex flex-col md:flex-row">
        <div
          className="md:w-2/5 aspect-square md:aspect-auto"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        />

        <div className="flex-1 p-4 md:p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
            <div className="flex-1 space-y-2 py-1">
              <div
                className="h-4 rounded w-32"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              />
              <div
                className="h-3 rounded w-24"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              />
            </div>
          </div>

          <div
            className="h-6 rounded w-3/4"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          />
          <div className="space-y-2">
            <div
              className="h-4 rounded w-full"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
            <div
              className="h-4 rounded w-5/6"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
          </div>

          <div className="flex items-center justify-between mt-auto gap-4">
            <div className="flex gap-4">
              <div
                className="h-8 w-16 rounded"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              />
              <div
                className="h-8 w-16 rounded"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              />
            </div>
            <div
              className="h-8 w-10 rounded"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
