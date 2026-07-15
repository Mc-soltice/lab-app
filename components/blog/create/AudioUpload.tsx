// components/blog/create/AudioUpload.tsx
"use client";

import { Music, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface AudioUploadProps {
  audio_url: string;
  onAudioChange: (url: string, duration?: number) => void;
  onAudioRemove: () => void;
}

export default function AudioUpload({
  audio_url,
  onAudioChange,
  onAudioRemove,
}: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const objectUrl = URL.createObjectURL(file);

    try {
      const duration = await new Promise<number | null>((resolve) => {
        const audio = new Audio();
        audio.src = objectUrl;
        audio.addEventListener("loadedmetadata", () => {
          resolve(Math.floor(audio.duration));
        });
        audio.addEventListener("error", () => {
          resolve(null);
        });
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog/podcasts");
      formData.append(
        "resourceType",
        file.type.startsWith("audio/") ? "auto" : "video",
      );

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.data?.secure_url) {
        throw new Error(result.error || "Impossible d'uploader l'audio");
      }

      setAudioDuration(duration ?? null);
      onAudioChange(result.data.secure_url, duration ?? undefined);
      toast.success("Audio uploadé avec succès");
    } catch (error) {
      console.error("Erreur upload audio:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload audio",
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
      const audio = new Audio();
      audio.src = url;
      audio.addEventListener("loadedmetadata", () => {
        const duration = Math.floor(audio.duration);
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
        <div
          className="p-4 rounded-xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5" style={{ color: "var(--accent)" }} />
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
          <audio controls src={audio_url} className="w-full mt-3" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--border)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "var(--border)")
          }
        >
          {isLoading ? (
            <>
              <div
                className="animate-spin rounded-full h-8 w-8 border-2"
                style={{ borderColor: "var(--accent)" }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Analyse du fichier audio...
              </span>
            </>
          ) : (
            <>
              <Music
                className="w-8 h-8"
                style={{ color: "var(--text-tertiary)" }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Ajouter un fichier audio
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                MP3, WAV, AAC (max 50MB)
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
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
        placeholder="Ou URL du fichier audio"
      />
    </div>
  );
}
