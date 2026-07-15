// components/blog/feed/MultimediaHub.tsx
"use client";

import ProductImage from "@/components/ProductImage";
import { Mic, Music, Pause, Play, Radio, Tv } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Types explicites
interface PodcastData {
  title: string;
  host: string;
  role: string;
  durationText: string;
  src: string;
  coverUrl: string;
}

interface VideoData {
  title: string;
  desc: string;
  url: string;
}

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

interface MultimediaHubProps {
  posts: Post[];
}

// Données par défaut pour les podcasts
const DEFAULT_PODCASTS: PodcastData[] = [
  {
    title: "Architecture & Écologie: Le Mariage Parfait",
    host: "Sophie Martin",
    role: "Architecte DPLG",
    durationText: "04:32",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "/podcast-cover-1.jpg",
  },
  {
    title: "Design Responsable: Créer pour Demain",
    host: "Thomas Dubois",
    role: "Designer d'intérieur",
    durationText: "03:45",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "/podcast-cover-2.jpg",
  },
  {
    title: "Innovation Matériaux: Le Futur du Bâtiment",
    host: "Claire Rousseau",
    role: "Ingénieure Matériaux",
    durationText: "05:12",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "/podcast-cover-3.jpg",
  },
];

// Données par défaut pour les vidéos
const DEFAULT_VIDEOS: VideoData[] = [
  {
    title: "Visite Guidée: Villa Moderne Écologique",
    desc: "Architecture durable en action",
    url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-31742-large.mp4",
  },
  {
    title: "Design d'Intérieur: Open Space Créatif",
    desc: "Aménagement collaboratif",
    url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-31742-large.mp4",
  },
];

export const MultimediaHub: React.FC<MultimediaHubProps> = ({ posts }) => {
  // Données en dur pour les podcasts
  const podcastsData: PodcastData[] = useMemo(() => {
    const dbPodcasts = posts.filter(
      (p): p is Post & { type: "podcast" } =>
        p.type === "podcast" && p.status === "published",
    );

    const mappedPodcasts: PodcastData[] = dbPodcasts.map((p) => ({
      title: p.title,
      host: p.authorName,
      role: p.authorRole || "Invitée",
      durationText: "04:30",
      src:
        p.audio_url ||
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverUrl: p.imageUrl || "/podcast-cover.jpg",
    }));

    return mappedPodcasts.length > 0 ? mappedPodcasts : DEFAULT_PODCASTS;
  }, [posts]);

  const videosData: VideoData[] = useMemo(() => {
    const dbVideos = posts.filter(
      (p): p is Post & { type: "video" } =>
        p.type === "video" && p.status === "published",
    );

    const mappedVideos: VideoData[] = dbVideos.map((p) => ({
      title: p.title,
      desc: p.excerpt,
      url:
        p.videoUrl ||
        "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-31742-large.mp4",
    }));

    return mappedVideos.length > 0 ? mappedVideos : DEFAULT_VIDEOS;
  }, [posts]);

  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    videosData[0]?.url || "",
  );
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>(
    videosData[0]?.title || "",
  );
  const [activePodcastIndex, setActivePodcastIndex] = useState<number>(0);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState<boolean>(false);
  const [podcastDuration, setPodcastDuration] = useState<number>(100);
  const [podcastCurrentTime, setPodcastCurrentTime] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Nettoyage de l'audio avec copie de la référence
  useEffect(() => {
    const audioElement = audioRef.current;
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
    };
  }, []);

  // Gestion de la lecture/pause
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      if (isPlayingPodcast) {
        audioElement.play().catch(() => setIsPlayingPodcast(false));
      } else {
        audioElement.pause();
      }
    }
  }, [isPlayingPodcast, activePodcastIndex]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.currentTime = newTime;
      setPodcastCurrentTime(newTime);
    }
  }, []);

  const handlePodcastSelect = useCallback((index: number) => {
    setActivePodcastIndex(index);
    setIsPlayingPodcast(true);
    setPodcastCurrentTime(0);
  }, []);

  const handleVideoSelect = useCallback((video: VideoData) => {
    setActiveVideoUrl(video.url);
    setActiveVideoTitle(video.title);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <section
      className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border shadow-xl sm:shadow-2xl"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      {/* Effets de fond - version mobile adaptée */}
      <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-cyan-500/5 rounded-full filter blur-2xl sm:blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-brand/5 rounded-full filter blur-2xl sm:blur-3xl pointer-events-none" />

      {/* Header - Version mobile */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 sm:pb-6 mb-4 sm:mb-8 gap-3 sm:gap-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span
              className="text-[8px] sm:text-[9px] md:text-[10px] font-mono uppercase tracking-wider sm:tracking-widest font-bold"
              style={{ color: "var(--accent)" }}
            >
              STUDIO CASTS // MÉDIAS EN DIRECT
            </span>
          </div>
          <h2
            className="text-lg sm:text-xl md:text-2xl font-display font-medium tracking-tight mt-1"
            style={{ color: "var(--text-primary)" }}
          >
            Podcasts & Visualisations
          </h2>
        </div>
        <div
          className="flex items-center gap-1.5 sm:gap-2 border rounded-full px-2 sm:px-3 py-0.5 sm:py-1 font-mono text-[8px] sm:text-[9px] uppercase tracking-wider"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <Radio
            className="w-2.5 sm:w-3 h-2.5 sm:h-3 animate-pulse"
            style={{ color: "var(--accent)" }}
          />
          <span className="hidden xs:inline">Canaux actifs</span>
          <span className="xs:hidden">Actifs</span>
        </div>
      </div>

      {/* Grille mobile-first */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-stretch">
        {/* Section Vidéo - Priorité mobile */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-3 sm:gap-4 order-first">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <Tv
              className="w-3 sm:w-4 h-3 sm:h-4"
              style={{ color: "var(--accent)" }}
            />
            <span
              className="text-[9px] sm:text-[10px] md:text-[11px] font-mono uppercase tracking-wider sm:tracking-widest"
              style={{ color: "var(--text-tertiary)" }}
            >
              FLUX VIDÉO
            </span>
          </div>

          {/* Conteneur vidéo responsive */}
          <div
            className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black border shadow-lg"
            style={{ borderColor: "var(--border)" }}
          >
            <video
              src={activeVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

            {/* Badge live - version adaptée */}
            <div
              className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1 bg-black/65 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-white/10 text-[8px] sm:text-[9px] font-mono"
              style={{ color: "var(--accent)" }}
            >
              <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-cyan-400 rounded-full animate-ping" />
              <span className="hidden xs:inline">LECTURE HD</span>
              <span className="xs:hidden">HD</span>
            </div>

            {/* Titre vidéo - version responsive */}
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
              <h4
                className="text-xs sm:text-sm font-display font-medium leading-tight truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {activeVideoTitle}
              </h4>
            </div>
          </div>

          {/* Sélecteur de vidéos - grille mobile */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-3 mt-0.5 sm:mt-1">
            {videosData.slice(0, 4).map((vid, index) => {
              const isActive = activeVideoUrl === vid.url;
              return (
                <button
                  key={`video-${index}`}
                  type="button"
                  onClick={() => handleVideoSelect(vid)}
                  className={`flex flex-col items-start text-left p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all`}
                  style={{
                    backgroundColor: isActive
                      ? "var(--bg-tertiary)"
                      : "var(--bg-tertiary)",
                    borderColor: isActive ? "var(--accent)" : "var(--border)",
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    opacity: isActive ? 1 : 0.5,
                  }}
                  aria-pressed={isActive}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "var(--bg-tertiary)";
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.opacity = "0.7";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "var(--bg-tertiary)";
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.opacity = "0.5";
                    }
                  }}
                >
                  <span className="text-[9px] sm:text-[10px] font-bold truncate w-full tracking-tight">
                    {vid.title}
                  </span>
                  <span
                    className="text-[7px] sm:text-[8.5px] font-mono uppercase mt-0.5 opacity-60 truncate w-full"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {vid.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Podcast - version mobile */}
        <div
          className="lg:col-span-12 xl:col-span-5 flex flex-col gap-3 sm:gap-4 border-t lg:border-t-0 lg:border-l pt-4 sm:pt-6 lg:pt-0 lg:pl-6 xl:pl-8 order-last lg:order-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <Mic
              className="w-3 sm:w-4 h-3 sm:h-4"
              style={{ color: "var(--accent)" }}
            />
            <span
              className="text-[9px] sm:text-[10px] md:text-[11px] font-mono uppercase tracking-wider sm:tracking-widest"
              style={{ color: "var(--text-tertiary)" }}
            >
              PODCAST STUDIO
            </span>
          </div>

          {/* Audio élément caché */}
          <audio
            ref={audioRef}
            src={podcastsData[activePodcastIndex]?.src || ""}
            onTimeUpdate={() => {
              const audioElement = audioRef.current;
              if (audioElement) {
                setPodcastCurrentTime(audioElement.currentTime);
              }
            }}
            onDurationChange={() => {
              const audioElement = audioRef.current;
              if (audioElement) {
                setPodcastDuration(audioElement.duration || 100);
              }
            }}
            onEnded={() => {
              setIsPlayingPodcast(false);
              setPodcastCurrentTime(0);
            }}
          />

          {/* Lecteur podcast - Version mobile optimisée */}
          <div
            className="border rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 relative overflow-hidden"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            {/* Barres audio animées - responsive */}
            <div className="absolute right-2 sm:right-4 top-2 sm:top-4 flex items-end gap-0.5 sm:gap-0.75 h-4 sm:h-5 w-6 sm:w-8">
              <div
                className="w-0.5 sm:w-0.75 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "var(--accent)",
                  height: isPlayingPodcast ? "100%" : "15%",
                }}
              />
              <div
                className="w-0.5 sm:w-0.75 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "var(--accent)",
                  height: isPlayingPodcast ? "70%" : "25%",
                }}
              />
              <div
                className="w-0.5 sm:w-0.75 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "var(--accent)",
                  height: isPlayingPodcast ? "110%" : "18%",
                }}
              />
              <div
                className="w-0.5 sm:w-0.75 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "var(--accent)",
                  height: isPlayingPodcast ? "55%" : "30%",
                }}
              />
            </div>

            {/* Info podcast - layout mobile */}
            <div className="flex gap-3 sm:gap-4 items-center">
              <div
                className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border relative shrink-0"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                {podcastsData[activePodcastIndex]?.coverUrl && (
                  <ProductImage
                    src={podcastsData[activePodcastIndex].coverUrl}
                    alt="Cover podcast"
                    fill
                    sizes="(max-width: 640px) 48px, 64px"
                    className="object-cover opacity-80"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Music
                    className="w-3.5 sm:w-5 h-3.5 sm:h-5"
                    style={{ color: "var(--text-secondary)" }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className="text-[7px] sm:text-[8.5px] font-mono tracking-wider sm:tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  DIFFUSION
                </span>
                <h4
                  className="text-[10px] sm:text-xs font-bold line-clamp-1 mt-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {podcastsData[activePodcastIndex]?.title}
                </h4>
                <span
                  className="text-[8px] sm:text-[10px] block truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {podcastsData[activePodcastIndex]?.host} (
                  {podcastsData[activePodcastIndex]?.role})
                </span>
              </div>
            </div>

            {/* Contrôle de progression */}
            <div className="flex flex-col gap-1 sm:gap-1.5 mt-1 sm:mt-2">
              <input
                type="range"
                min={0}
                max={podcastDuration}
                value={podcastCurrentTime}
                onChange={handleSeek}
                className="w-full h-1 sm:h-1.5 rounded-lg cursor-pointer"
                style={{
                  accentColor: "var(--accent)",
                  backgroundColor: "var(--border)",
                }}
                aria-label="Progression du podcast"
              />
              <div
                className="flex justify-between text-[7px] sm:text-[9px] font-mono"
                style={{ color: "var(--text-tertiary)" }}
              >
                <span>{formatTime(podcastCurrentTime)}</span>
                <span>{formatTime(podcastDuration)}</span>
              </div>
            </div>

            {/* Boutons de contrôle */}
            <div className="flex items-center justify-between mt-0.5 sm:mt-1">
              <button
                type="button"
                onClick={() => setIsPlayingPodcast(!isPlayingPodcast)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 font-extrabold uppercase font-display tracking-wider text-[9px] sm:text-xs rounded-lg sm:rounded-xl shadow-lg transition-all"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--text-primary)",
                }}
                aria-label={
                  isPlayingPodcast ? "Mettre en pause" : "Écouter le podcast"
                }
              >
                {isPlayingPodcast ? (
                  <Pause className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 fill-current" />
                ) : (
                  <Play className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 fill-current" />
                )}
                <span>{isPlayingPodcast ? "Pause" : "Écouter"}</span>
              </button>
              <div
                className="text-[7px] sm:text-[9px] font-mono"
                style={{ color: "var(--text-secondary)" }}
              >
                Ép. {activePodcastIndex + 1}/{podcastsData.length}
              </div>
            </div>
          </div>

          {/* Liste des podcasts - Version mobile */}
          <div className="flex flex-col gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 max-h-45 sm:max-h-55 md:max-h-70 overflow-y-auto scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">
            {podcastsData.map((pod, idx) => {
              const isSelected = activePodcastIndex === idx;
              return (
                <button
                  key={`${pod.title}-${idx}`}
                  type="button"
                  onClick={() => handlePodcastSelect(idx)}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl border cursor-pointer transition-all text-left`}
                  style={{
                    backgroundColor: isSelected
                      ? "var(--bg-tertiary)"
                      : "var(--bg-secondary)",
                    borderColor: isSelected ? "var(--accent)" : "transparent",
                    color: isSelected
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    opacity: isSelected ? 1 : 0.4,
                  }}
                  aria-pressed={isSelected}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor =
                        "var(--bg-tertiary)";
                      e.currentTarget.style.opacity = "0.6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor =
                        "var(--bg-secondary)";
                      e.currentTarget.style.opacity = "0.4";
                    }
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span
                      className="font-mono text-[8px] sm:text-[10px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      [{idx + 1}]
                    </span>
                    <div className="min-w-0">
                      <span className="text-[9px] sm:text-[11px] font-bold block truncate">
                        {pod.title}
                      </span>
                      <span
                        className="text-[7px] sm:text-[8.5px] font-mono truncate block"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Par {pod.host}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[8px] sm:text-[9.5px] font-mono uppercase border px-1.5 sm:px-2 py-0.5 rounded shrink-0"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {pod.durationText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
