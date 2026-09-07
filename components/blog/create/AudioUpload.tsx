// components/blog/create/AudioUpload.tsx
"use client";

import { Film, Loader2, Music, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface AudioUploadProps {
  audio_url: string;
  media_type?: "AUDIO" | "VIDEO";
  onAudioChange: (
    url: string,
    duration?: number,
    mediaType?: "AUDIO" | "VIDEO",
  ) => void;
  onAudioRemove: () => void;
}

async function optimizeVideoForUpload(file: File): Promise<File> {
  if (file.size <= 25 * 1024 * 1024 || typeof MediaRecorder === "undefined") {
    return file;
  }

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error("Vidéo illisible")), {
        once: true,
      });
    });

    const source = (
      video as HTMLVideoElement & {
        captureStream?: () => MediaStream;
      }
    ).captureStream?.();
    if (!source) return file;

    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    );
    if (!mimeType) return file;

    const recorder = new MediaRecorder(source, {
      mimeType,
      videoBitsPerSecond: 2_500_000,
    });
    const chunks: Blob[] = [];
    const optimized = new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      recorder.addEventListener("stop", () =>
        resolve(new Blob(chunks, { type: mimeType })),
      );
      recorder.addEventListener("error", () =>
        reject(new Error("Réencodage impossible")),
      );
    });

    recorder.start();
    await video.play();
    await new Promise<void>((resolve) => {
      video.addEventListener("ended", () => resolve(), { once: true });
    });
    recorder.stop();

    const blob = await optimized;
    return blob.size < file.size
      ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webm`, {
          type: mimeType,
        })
      : file;
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(video.src);
  }
}

export default function AudioUpload({
  audio_url,
  media_type = "AUDIO",
  onAudioChange,
  onAudioRemove,
}: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      toast.error("Sélectionnez un fichier audio ou vidéo valide");
      return;
    }
    if (file.size > 250 * 1024 * 1024) {
      toast.error("Le média ne doit pas dépasser 250 Mo");
      return;
    }

    setIsLoading(true);
    const optimizedFile = file.type.startsWith("video/")
      ? await optimizeVideoForUpload(file)
      : file;
    const objectUrl = URL.createObjectURL(optimizedFile);
    const detectedMediaType = file.type.startsWith("video/") ? "VIDEO" : "AUDIO";

    try {
      const duration = await new Promise<number | null>((resolve) => {
        const media = document.createElement(
          detectedMediaType === "VIDEO" ? "video" : "audio",
        );
        media.preload = "metadata";
        media.src = objectUrl;
        media.addEventListener("loadedmetadata", () => {
          resolve(Number.isFinite(media.duration) ? Math.floor(media.duration) : null);
        });
        media.addEventListener("error", () => {
          resolve(null);
        });
      });

      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("folder", "blog/podcasts");
      formData.append("resourceType", detectedMediaType === "VIDEO" ? "video" : "auto");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.data?.secure_url) {
        throw new Error(result.error || "Impossible d'uploader le média");
      }

      setAudioDuration(duration ?? null);
      onAudioChange(result.data.secure_url, duration ?? undefined, detectedMediaType);
      toast.success(
        `${detectedMediaType === "VIDEO" ? "Vidéo" : "Audio"} uploadé avec succès`,
      );
    } catch (error) {
      console.error("Erreur upload audio:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'upload du média",
      );
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onAudioChange(url);

    // Si c'est une URL, essayer d'extraire la durée
    if (url && (url.startsWith("http") || url.startsWith("https"))) {
      const media = document.createElement(media_type === "VIDEO" ? "video" : "audio");
      media.preload = "metadata";
      media.src = url;
      media.addEventListener("loadedmetadata", () => {
        const duration = Math.floor(media.duration);
        setAudioDuration(duration);
        onAudioChange(url, duration);
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="border rounded-xl p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <label
        className="block text-sm font-medium mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        Fichier audio
      </label>

      {audio_url ? (
        <div className="p-4 rounded-xl border" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            {media_type === "VIDEO" ? (
              <Film className="w-5 h-5" style={{ color: "var(--accent)" }} />
            ) : (
              <Music className="w-5 h-5" style={{ color: "var(--accent)" }} />
            )}
            <span
              className="text-sm truncate flex-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {audio_url.split("/").pop() || "audio.mp3"}
            </span>
            {audioDuration !== null && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                {formatDuration(audioDuration)}
              </span>
            )}
            <button
              type="button"
              onClick={onAudioRemove}
              className="p-1 rounded-xl transition-opacity"
              style={{ backgroundColor: "var(--color-danger)", color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {media_type === "VIDEO" ? (
            <video
              controls
              src={audio_url}
              className="mt-3 max-h-72 w-full rounded-xl"
              preload="metadata"
            />
          ) : (
            <audio
              controls
              src={audio_url}
              className="mt-3 w-full"
              preload="metadata"
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--border)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          {isLoading ? (
            <>
              <div
                className="animate-spin rounded-full h-8 w-8 border-2"
                style={{ borderColor: "var(--accent)" }}
              />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Analyse du fichier audio...
              </span>
            </>
          ) : (
            <>
              {media_type === "VIDEO" ? (
                <Film className="w-8 h-8" style={{ color: "var(--text-tertiary)" }} />
              ) : (
                <Music className="w-8 h-8" style={{ color: "var(--text-tertiary)" }} />
              )}
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Ajouter un fichier {media_type === "VIDEO" ? "vidéo" : "audio"}
              </span>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Audio ou vidéo (max 250MB)
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />

      <input
        type="url"
        value={audio_url}
        onChange={handleUrlChange}
        className="mt-3 w-full px-3 py-2 text-sm rounded-xl border focus:ring-0"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        placeholder="Ou URL du fichier audio ou vidéo"
      />
    </div>
  );
}
