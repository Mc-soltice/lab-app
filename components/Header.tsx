"use client";

import { useFollowing } from "@/hooks/blog/post/useFollowing";
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
  const profileHref = user?.username
    ? `/profile/${encodeURIComponent(user.username)}`
    : "/profile";

  const initials = useMemo(() => {
    const parts = String(displayName).trim().split(/\s+/);
    if (parts.length === 0) return "JD";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  return (
    <header className="sticky top-4 z-20 rounded-3xl border border-neutral-800 bg-[#1b1b1b] p-3 sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
        {/* Profile Section */}
        <Link
          href={profileHref}
          className="flex flex-col items-center gap-1 sm:gap-2 shrink-0 hover:opacity-90 transition-opacity"
        >
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
        </Link>

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
