//components/blog/podcast/useMediaPlayer
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface MediaTrack {
  src: string;
}

interface MediaElementProps {
  onTimeUpdate: () => void;
  onDurationChange: () => void;
  onEnded: () => void;
}

interface UseMediaPlayerResult<T extends MediaTrack> {
  mediaRef: React.RefObject<HTMLMediaElement | null>;
  activeIndex: number;
  activeTrack: T | undefined;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  select: (index: number) => void;
  next: () => void;
  previous: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  /** À spread sur l'élément actif : {...player.mediaElementProps} */
  mediaElementProps: MediaElementProps;
}

/**
 * Pilote un lecteur à playlist reposant sur UN SEUL élément média actif
 * à la fois — <audio> ou <video>, peu importe, les deux implémentent
 * HTMLMediaElement. Sélection, lecture/pause, mute, seek et progression
 * sont donc partagés entre podcasts et vidéos sans dupliquer la logique.
 * Le composant appelant est responsable de rendre le bon type de balise
 * (audio caché ou vidéo visible) et d'y attacher `mediaRef`.
 */
export function useMediaPlayer<T extends MediaTrack>(
  tracks: T[],
): UseMediaPlayerResult<T> {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Resynchronise lecture/pause et mute à chaque changement de piste ou d'état.
  useEffect(() => {
    const mediaElement = mediaRef.current;
    if (!mediaElement) return;

    mediaElement.muted = isMuted;

    if (isPlaying) {
      mediaElement.play().catch(() => setIsPlaying(false));
    } else {
      mediaElement.pause();
    }
  }, [isPlaying, isMuted, activeIndex]);

  const select = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const next = useCallback(() => {
    setActiveIndex((prev) => (tracks.length > 0 ? (prev + 1) % tracks.length : prev));
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  }, [tracks.length]);

  const previous = useCallback(() => {
    setActiveIndex((prev) =>
      tracks.length > 0 ? (prev - 1 + tracks.length) % tracks.length : prev,
    );
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  }, [tracks.length]);

  const togglePlay = useCallback(() => setIsPlaying((prev) => !prev), []);
  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  const seek = useCallback((time: number) => {
    const mediaElement = mediaRef.current;
    if (mediaElement) {
      mediaElement.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const mediaElement = mediaRef.current;
    if (mediaElement) setCurrentTime(mediaElement.currentTime);
  }, []);

  const handleDurationChange = useCallback(() => {
    const mediaElement = mediaRef.current;
    if (mediaElement && Number.isFinite(mediaElement.duration))
      setDuration(mediaElement.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  return {
    mediaRef,
    activeIndex,
    activeTrack: tracks[activeIndex],
    isPlaying,
    isMuted,
    currentTime,
    duration,
    select,
    next,
    previous,
    togglePlay,
    toggleMute,
    seek,
    mediaElementProps: {
      onTimeUpdate: handleTimeUpdate,
      onDurationChange: handleDurationChange,
      onEnded: handleEnded,
    },
  };
}
