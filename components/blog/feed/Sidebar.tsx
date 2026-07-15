// app/blog/components/Sidebar.tsx
"use client";
import ProductImage from "@/components/ProductImage";
import { Plus } from "lucide-react";

interface Author {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Post {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  // Ajoutez d'autres propriétés selon votre modèle de données
}

interface SidebarProps {
  authors: Author[];
  followedAuthors: string[];
  savedPosts: string[];
  posts: Post[];
  onFollowAuthor: (authorId: string) => void;
  onViewAuthor: (authorId: string) => void;
  onViewPost: (postId: string) => void;
  onPublishClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  authors: _authors,
  followedAuthors: _followedAuthors,
  savedPosts,
  posts,
  onFollowAuthor: _onFollowAuthor,
  onViewAuthor: _onViewAuthor,
  onViewPost,
  onPublishClick,
}) => {
  const savedPostsData = posts.filter((p) => savedPosts.includes(p.id));

  return (
    <div className="flex flex-col gap-6">
      {/* Widget publication */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 border shadow-[0_4px_30px_rgba(212,255,0,0.05)] group"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--accent)",
        }}
      >
        <div
          className="absolute -right-16 -top-16 w-36 h-36 rounded-full filter blur-2xl pointer-events-none group-hover:scale-110 transition-transform"
          style={{ backgroundColor: "var(--accent)" }}
        />
        <span
          className="text-[10px] font-mono uppercase border px-2.5 py-1 rounded-full tracking-widest font-bold"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--accent)",
            color: "var(--accent)",
          }}
        >
          PARTAGEZ
        </span>
        <h3
          className="text-lg font-display font-medium mt-4 mb-2 leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          Vous avez un projet ?
        </h3>
        <p
          className="text-xs leading-relaxed mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          Publiez vos analyses, croquis d&apos;architecture ou concepts de
          design.
        </p>
        <button
          type="button"
          onClick={onPublishClick}
          className="w-full py-3 font-bold font-display uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--text-primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent)";
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent)";
            e.currentTarget.style.opacity = "1";
          }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Publier un article</span>
        </button>
      </div>

      {/* Sauvegardes */}
      <div
        className="frosted-glass rounded-3xl p-6"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      >
        <h3
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "var(--text-tertiary)" }}
        >
          Vos Sauvegardes ({savedPosts.length})
        </h3>
        {savedPosts.length === 0 ? (
          <p
            className="text-[10px] font-mono uppercase tracking-wider py-4 text-center"
            style={{ color: "var(--text-tertiary)" }}
          >
            Aucun article enregistré
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {savedPostsData.slice(0, 3).map((post) => (
              <div
                key={post.id}
                onClick={() => onViewPost(post.id)}
                className="p-3 transition-colors rounded-xl flex items-center gap-3 cursor-pointer"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }}
              >
                <div
                  className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <ProductImage
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className="text-xs font-medium block hover:text-(--accent) truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {post.title}
                  </span>
                  <span
                    className="text-[8px] font-mono uppercase"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {post.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
