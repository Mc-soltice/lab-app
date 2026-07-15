// components/feed/PostCard.tsx
"use client";
import ProductImage from "@/components/ProductImage";
import { category_response } from "@/types/blog/category.types";
import { user_response } from "@/types/blog/user.types";
import { Bookmark, Heart, MessageSquare, Mic, Play, Tv } from "lucide-react";
import React, { useState } from "react";

// Types adaptés du premier composant
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
  type?: "podcast" | "video" | "article";
  podcastDuration?: string;
  likesCount?: number;
  authorId?: string;
}

interface PostCardProps {
  post: PostWithAuthor;
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  onLike?: (postId: string, e: React.MouseEvent) => Promise<void> | void;
  onSave?: (postId: string, e: React.MouseEvent) => void;
  onFollow?: (authorId: string, e: React.MouseEvent) => void;
  onViewPost?: (postId: string) => void;
  onViewAuthor?: (authorId: string) => void;
  onTriggerMultimedia?: (post: PostWithAuthor, e: React.MouseEvent) => void;
}

// Helpers adaptés du premier composant
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

const getAuthorAvatar = (
  author: user_response | undefined,
  post: PostWithAuthor,
): string => {
  if (author?.image) return author.image;
  if (post.authorAvatar) return post.authorAvatar;
  const name = getAuthorName(author, post);
  return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${name[0] ?? "U"}`;
};

const getAuthorId = (
  author: user_response | undefined,
  post: PostWithAuthor,
): string => {
  if (author?.id) return author.id;
  if (post.authorId) return post.authorId;
  return post.id;
};

const getCategoryName = (post: PostWithAuthor): string => {
  // Priorité aux categories (tableau)
  if (post.categories && post.categories.length > 0) {
    return post.categories[0]?.category.name ?? "Non catégorisé";
  }
  // Sinon category direct
  if (typeof post.category === "string") {
    return post.category;
  }
  if (post.category?.name) {
    return post.category.name;
  }
  return "Non catégorisé";
};

export const PostCard2: React.FC<PostCardProps> = ({
  post,
  commentsCount = 0,
  isLiked = false,
  isSaved = false,
  isFollowing = false,
  onLike,
  onSave,
  onFollow,
  onViewPost,
  onViewAuthor,
  onTriggerMultimedia,
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);

  // Gestion des valeurs par défaut (logique du premier composant)
  const createdAt =
    post.created_at ?? post.published_at ?? new Date().toISOString();
  const cover_image =
    post.cover_image ?? post.imageUrl ?? "https://picsum.photos/400/400";
  const authorName = getAuthorName(post.author, post);
  const authorAvatar = getAuthorAvatar(post.author, post);
  const authorId = getAuthorId(post.author, post);
  const categoryName = getCategoryName(post);
  const likesCount =
    (post._count?.likes ?? post.likesCount ?? 0) + (liked ? 1 : 0);
  const displayCommentsCount = post._count?.comments ?? commentsCount;
  const isMultimedia = post.type === "podcast" || post.type === "video";

  // Handlers avec logique d'état local
  const handleCardClick = () => onViewPost?.(post.slug || post.id);

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewAuthor?.(authorId);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    await onLike?.(post.id, e);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(post.id, e);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow?.(authorId, e);
  };

  const handleMediaTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTriggerMultimedia?.(post, e);
  };

  return (
    <article
      className="frosted-glass rounded-3xl overflow-hidden group transition-all cursor-pointer bg-(--bg-secondary) border border-transparent hover:border-(--border)"
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      role="button"
      tabIndex={0}
      aria-label={`Article : ${post.title}`}
    >
      {/* En-tête auteur */}
      <div className="p-5 flex items-center justify-between border-b border-(--border) bg-(--bg-tertiary)">
        <div
          className="flex items-center gap-3"
          onClick={handleAuthorClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleAuthorClick(e as any)}
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-(--border) bg-(--bg-secondary)">
            <ProductImage
              src={authorAvatar}
              alt={`Avatar de ${authorName}`}
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-bold text-(--text-primary) block hover:text-(--accent) transition-colors">
              {authorName}
            </span>
            <span className="text-[9px] font-mono text-(--text-tertiary) uppercase tracking-wider">
              {post.authorRole ?? "Membre"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-(--bg-tertiary) border border-(--border) text-(--text-tertiary)">
            {categoryName}
          </span>
          <button
            type="button"
            onClick={handleFollowClick}
            className={`text-[9px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded transition-colors ${
              isFollowing
                ? "text-(--text-tertiary) hover:text-(--text-primary) bg-(--bg-tertiary)"
                : "text-(--accent) hover:text-(--text-primary) bg-(--bg-tertiary) border border-(--accent)"
            }`}
            aria-label={
              isFollowing
                ? `Ne plus suivre ${authorName}`
                : `Suivre ${authorName}`
            }
          >
            {isFollowing ? "Abonné" : "Suivre"}
          </button>
        </div>
      </div>

      {/* Image de couverture */}
      <div className="relative aspect-video bg-(--bg-secondary) group-hover:opacity-95 transition-opacity overflow-hidden">
        <ProductImage
          src={cover_image}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 760px, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        {/* Overlay multimédia */}
        {isMultimedia && onTriggerMultimedia && (
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex justify-between items-start">
              <span className="flex items-center gap-1.5 bg-brand text-black px-2.5 py-1 rounded-md text-[9px] font-mono font-extrabold uppercase tracking-wider shadow-lg">
                {post.type === "podcast" ? (
                  <Mic className="w-3 h-3 text-black" />
                ) : (
                  <Tv className="w-3 h-3 text-black" />
                )}
                <span>{post.type === "podcast" ? "PODCAST" : "VIDÉO"}</span>
              </span>
              {post.type === "podcast" && post.podcastDuration && (
                <span className="bg-black/85 text-white/80 border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                  {post.podcastDuration}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleMediaTrigger}
              className="flex items-center gap-2 self-start bg-(--accent) hover:bg-(--accent-hover) text-(--text-primary) font-extrabold font-mono text-[9px] uppercase px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
              aria-label={`Lire ${post.type === "podcast" ? "le podcast" : "la vidéo"} : ${post.title}`}
            >
              <Play className="w-3 h-3 fill-(--text-primary) text-(--text-primary)" />
              <span>{post.type === "podcast" ? "ÉCOUTER" : "REGARDER"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions et contenu */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 text-xs font-mono py-1.5 px-3 rounded-xl transition-all ${
                liked
                  ? "text-red-400 bg-red-500/10 border border-red-500/15"
                  : "text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-tertiary)"
              }`}
              aria-label={liked ? "Je n’aime plus" : "J’aime"}
            >
              <Heart
                className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs font-mono text-(--text-tertiary) py-1.5 px-3">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{displayCommentsCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveClick}
            className={`p-2 rounded-xl transition-colors ${
              saved
                ? "text-(--accent) bg-(--bg-tertiary)"
                : "text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-tertiary)"
            }`}
            aria-label={saved ? "Retirer des sauvegardes" : "Sauvegarder"}
          >
            <Bookmark
              className={`w-4 h-4 ${saved ? "fill-(--accent) text-(--accent)" : ""}`}
            />
          </button>
        </div>

        <h3 className="text-lg md:text-xl font-display font-light text-(--text-primary) leading-snug group-hover:text-(--accent) transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-(--text-secondary) leading-relaxed mt-2 line-clamp-2 md:line-clamp-3 font-light font-sans">
          {post.excerpt ?? post.content.slice(0, 100)}
        </p>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-(--border) font-mono text-[9px] text-(--text-tertiary) uppercase tracking-wider">
          <time
            dateTime={
              typeof createdAt === "string"
                ? createdAt
                : createdAt.toISOString()
            }
          >
            {new Date(createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
          <span className="text-(--accent) group-hover:translate-x-1 duration-200 transition-transform block">
            Lire l’article →
          </span>
        </div>
      </div>
    </article>
  );
};
