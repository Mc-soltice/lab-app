// components/blog/feed/MultimediaHub.tsx
"use client";

import OptimizedImage from "@/components/ui/OptimizedImage";
import { useMediaPlayer } from "@/hooks/blog/podcast/use-media-player";
import {
  Mic,
  Music,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Tv,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useCallback, useMemo } from "react";

// Types explicites
interface Post {
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

interface MediaItem {
  id: string;
  type: "podcast" | "video";
  title: string;
  subtitle: string;
  src: string;
  coverUrl?: string;
  videoUrl?: string;
}

interface MultimediaHubProps {
  posts: Post[];
}

// ============================================================
// Composant principal
// ============================================================
export const MultimediaHub: React.FC<MultimediaHubProps> = ({ posts }) => {
  const mediaItems: MediaItem[] = useMemo(() => {
    return posts
      .filter(
        (p) => p.status === "published" && (p.type === "podcast" || p.type === "video"),
      )
      .reduce<MediaItem[]>((acc, p) => {
        if (p.type === "podcast" && (p.audio_url || p.videoUrl)) {
          const podcastSrc = p.videoUrl ?? p.audio_url ?? "";
          acc.push({
            id: p.id,
            type: "podcast",
            title: p.title,
            subtitle: p.authorRole ? `${p.authorName} · ${p.authorRole}` : p.authorName,
            src: podcastSrc,
            coverUrl: p.imageUrl,
            videoUrl: p.videoUrl ?? undefined,
          });
        } else if (p.type === "video" && p.videoUrl) {
          acc.push({
            id: p.id,
            type: "video",
            title: p.title,
            subtitle: p.excerpt,
            src: p.videoUrl,
            coverUrl: p.imageUrl,
            videoUrl: p.videoUrl,
          });
        }
        return acc;
      }, []);
  }, [posts]);

  // Utilisation du hook
  const player = useMediaPlayer(mediaItems);

  const formatTime = useCallback((seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const activeItem = player.activeTrack;
  const activeMediaIsVideo =
    !!activeItem && (activeItem.type === "video" || !!activeItem.videoUrl);

  // ============================================================
  // Rendu
  // ============================================================
  return (
    <section
      className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 border shadow-xl sm:shadow-2xl"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      {/* Effets de fond */}
      <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-cyan-500/5 rounded-full filter blur-2xl sm:blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-brand/5 rounded-full filter blur-2xl sm:blur-3xl pointer-events-none" />

      {mediaItems.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-12 sm:py-16 text-center"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Radio className="w-6 h-6 sm:w-8 sm:h-8 opacity-40" />
          <p className="text-xs sm:text-sm font-mono uppercase tracking-wider">
            Aucun podcast ni vidéo publié pour le moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          {/* Colonne principale - Flux média */}
          <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-2 sm:gap-3 order-first">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
              {activeMediaIsVideo ? (
                <Tv
                  className="w-3 sm:w-4 h-3 sm:h-4"
                  style={{ color: "var(--accent)" }}
                />
              ) : (
                <Mic
                  className="w-3 sm:w-4 h-3 sm:h-4"
                  style={{ color: "var(--accent)" }}
                />
              )}
              <span
                className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                {activeMediaIsVideo ? "FLUX VIDÉO" : "LECTURE AUDIO"}
              </span>
            </div>

            {/* Lecteur */}
            <div
              className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black border shadow-lg"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Vidéo */}
              {activeMediaIsVideo && activeItem && (
                <video
                  key={activeItem.id}
                  ref={player.mediaRef as React.Ref<HTMLVideoElement>}
                  src={activeItem.src}
                  poster={activeItem.coverUrl}
                  playsInline
                  controls
                  autoPlay={player.isPlaying}
                  muted={player.isMuted}
                  preload="metadata"
                  {...player.mediaElementProps}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Podcast avec image de couverture */}
              {activeItem?.type === "podcast" && !activeItem.videoUrl && (
                <>
                  <audio
                    key={activeItem.id}
                    ref={player.mediaRef as React.Ref<HTMLAudioElement>}
                    src={activeItem.src}
                    {...player.mediaElementProps}
                  />
                  {activeItem.coverUrl ? (
                    <OptimizedImage
                      src={activeItem.coverUrl}
                      alt={activeItem.title}
                      fill
                      className="object-cover opacity-80"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music
                        className="w-10 h-10 opacity-30"
                        style={{ color: "var(--text-secondary)" }}
                      />
                    </div>
                  )}
                  {/* Barres audio animées */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none">
                    {[0.4, 0.9, 0.6, 1, 0.5].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 sm:w-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: "var(--accent)",
                          height: player.isPlaying ? `${h * 60}%` : "12%",
                          opacity: player.isPlaying ? 0.9 : 0.35,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

              {/* Badge statut */}
              <div
                className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1 bg-black/65 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-white/10 text-[8px] sm:text-[9px] font-mono"
                style={{ color: "var(--accent)" }}
              >
                <span
                  className={`w-1 sm:w-1.5 h-1 sm:h-1.5 bg-cyan-400 rounded-full ${player.isPlaying ? "animate-ping" : ""}`}
                />
                <span className="hidden xs:inline">
                  {player.isPlaying ? "LECTURE EN COURS" : "EN PAUSE"}
                </span>
                <span className="xs:hidden">{player.isPlaying ? "LIVE" : "PAUSE"}</span>
              </div>

              {/* Titre en bas */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                <h4
                  className="text-xs sm:text-sm font-display font-medium leading-tight truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activeItem?.title}
                </h4>
                <span
                  className="text-[9px] sm:text-[10px] block truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {activeItem?.subtitle}
                </span>
              </div>
            </div>

            {/* Contrôles */}
            <div
              className="flex flex-col gap-2 border rounded-xl sm:rounded-2xl p-3 sm:p-4"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
              }}
            >
              {/* Barre de progression */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className="text-[7px] sm:text-[8px] font-mono tabular-nums w-10 sm:w-12 text-right"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {formatTime(player.currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={player.duration || 0}
                  value={player.currentTime}
                  onChange={(e) => player.seek(Number(e.target.value))}
                  className="flex-1 h-1 sm:h-1.5 rounded-lg cursor-pointer"
                  style={{
                    accentColor: "var(--accent)",
                    backgroundColor: "var(--border)",
                  }}
                  aria-label="Progression de la lecture"
                />
                <span
                  className="text-[7px] sm:text-[8px] font-mono tabular-nums w-10 sm:w-12"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {formatTime(player.duration)}
                </span>
              </div>

              {/* Boutons de contrôle */}
              <div className="flex items-center justify-between">
                {/* Groupe gauche : Volume */}
                <div className="flex items-center gap-1 sm:gap-2 min-w-20 sm:min-w-25">
                  <button
                    type="button"
                    onClick={player.toggleMute}
                    className="p-1 rounded transition-colors hover:bg-black/10"
                    style={{ color: "var(--text-secondary)" }}
                    aria-label={player.isMuted ? "Activer le son" : "Couper le son"}
                  >
                    {player.isMuted ? (
                      <VolumeX className="w-3 sm:w-4 h-3 sm:h-4" />
                    ) : (
                      <Volume2 className="w-3 sm:w-4 h-3 sm:h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={player.isMuted ? 0 : 0.8}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val === 0 && !player.isMuted) {
                        player.toggleMute();
                      } else if (val > 0 && player.isMuted) {
                        player.toggleMute();
                      }
                      // Note: le hook ne gère pas le volume directement,
                      // on utilise le volume par défaut du navigateur
                    }}
                    className="w-12 sm:w-16 h-1 rounded-lg cursor-pointer"
                    style={{
                      accentColor: "var(--accent)",
                      backgroundColor: "var(--border)",
                    }}
                    aria-label="Volume"
                  />
                </div>

                {/* Groupe centre : Navigation */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={player.previous}
                    disabled={mediaItems.length <= 1}
                    className="p-1.5 sm:p-2 rounded-lg transition-all hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: "var(--text-secondary)" }}
                    aria-label="Précédent"
                  >
                    <SkipBack className="w-3 sm:w-4 h-3 sm:h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={player.togglePlay}
                    disabled={!activeItem}
                    className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--text-primary)",
                    }}
                    aria-label={
                      player.isPlaying ? "Mettre en pause" : "Lancer la lecture"
                    }
                  >
                    {player.isPlaying ? (
                      <Pause className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" />
                    ) : (
                      <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={player.next}
                    disabled={mediaItems.length <= 1}
                    className="p-1.5 sm:p-2 rounded-lg transition-all hover:bg-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: "var(--text-secondary)" }}
                    aria-label="Suivant"
                  >
                    <SkipForward className="w-3 sm:w-4 h-3 sm:h-4" />
                  </button>
                </div>

                {/* Groupe droite : espace vide pour équilibrer */}
                <div className="min-w-20 sm:min-w-25 hidden sm:block" />
              </div>
            </div>
          </div>

          {/* Colonne playlist */}
          <div
            className="lg:col-span-12 xl:col-span-5 flex flex-col gap-2 sm:gap-3 lg:border-t-0 pt-3 sm:pt-4 lg:pt-0 lg:pl-4 xl:pl-6 order-last lg:order-0"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Radio
                className="w-3 sm:w-4 h-3 sm:h-4"
                style={{ color: "var(--accent)" }}
              />
              <span
                className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                PLAYLIST
              </span>
              <span
                className="text-[7px] sm:text-[8px] font-mono ml-auto"
                style={{ color: "var(--text-tertiary)" }}
              >
                {mediaItems.length} titres
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5 max-h-70 sm:max-h-90 md:max-h-110 overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
              {mediaItems.map((item, idx) => {
                const isSelected = player.activeIndex === idx;
                const isPlayingNow = isSelected && player.isPlaying;
                const itemIsVideo = item.type === "video" || !!item.videoUrl;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => player.select(idx)}
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg sm:rounded-xl border cursor-pointer transition-all text-left"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--bg-tertiary)"
                        : "var(--bg-secondary)",
                      borderColor: isSelected ? "var(--accent)" : "transparent",
                      color: isSelected
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      opacity: isSelected ? 1 : 0.55,
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className="relative">
                        {itemIsVideo ? (
                          <Tv
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
                            style={{ color: "var(--accent)" }}
                          />
                        ) : (
                          <Mic
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
                            style={{ color: "var(--accent)" }}
                          />
                        )}
                        {isPlayingNow && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] font-bold block truncate">
                          {item.title}
                        </span>
                        <span
                          className="text-[7px] sm:text-[8px] font-mono truncate block"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-[7px] sm:text-[8px] font-mono uppercase border px-1.5 sm:px-2 py-0.5 rounded shrink-0 ml-1"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {itemIsVideo ? "Vidéo" : "Audio"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
