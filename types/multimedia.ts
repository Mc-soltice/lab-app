export type MediaKind = "podcast" | "video";

/**
 * Modèle unifié : une carte de coverflow, qu'elle vienne d'un podcast
 * (image de cover + audio) ou d'une vidéo (le flux vidéo sert lui-même
 * de visuel). C'est ce type unique qui alimente le carrousel et la
 * barre de contrôle flottante.
 */
export interface MediaCard {
  id: string;
  kind: MediaKind;
  title: string;
  subtitle: string;
  src: string;
  /** Uniquement pour les podcasts ; les vidéos utilisent leur 1re frame comme visuel. */
  coverUrl?: string;
}

export interface MultimediaPost {
  id: string;
  title: string;
  excerpt: string;
  type?: "article" | "podcast" | "video";
  status?: "draft" | "published" | "archived";
  authorName: string;
  authorRole?: string;
  imageUrl?: string;
  videoUrl?: string;
  audio_url?: string;
  category: string;
}
