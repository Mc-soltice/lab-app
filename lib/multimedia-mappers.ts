import type { MediaCard, MultimediaPost } from "@/types/multimedia";

/**
 * Convertit les posts publiés (podcasts + vidéos) en une liste unique
 * de MediaCard pour le coverflow. Aucune valeur par défaut : un post
 * sans média réel (videoUrl / audio_url) est exclu plutôt que complété
 * par un contenu de remplacement.
 */
export function mapPostsToMediaCards(posts: MultimediaPost[]): MediaCard[] {
  const videos: MediaCard[] = posts
    .filter(
      (p): p is MultimediaPost & { videoUrl: string } =>
        p.type === "video" && p.status === "published" && Boolean(p.videoUrl),
    )
    .map((p) => ({
      id: p.id,
      kind: "video",
      title: p.title,
      subtitle: p.excerpt,
      src: p.videoUrl,
    }));

  const podcasts: MediaCard[] = posts
    .filter(
      (p): p is MultimediaPost & { audio_url: string } =>
        p.type === "podcast" && p.status === "published" && Boolean(p.audio_url),
    )
    .map((p) => ({
      id: p.id,
      kind: "podcast",
      title: p.title,
      subtitle: `${p.authorName}${p.authorRole ? ` — ${p.authorRole}` : ""}`,
      src: p.audio_url,
      coverUrl: p.imageUrl,
    }));

  return [...videos, ...podcasts];
}
