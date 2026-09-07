// components/blog/create/CoverImageUpload.tsx
"use client";

import ProductImage from "@/components/ProductImage";
import { AlertCircle, ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface CoverImageUploadProps {
  cover_image: string;
  isUploading: boolean;
  uploadProgress?: number;
  uploadError?: string | null;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove: () => void;
  onUrlChange: (url: string) => void;
  onDeleteImage?: (publicId: string) => Promise<boolean>; // Ajouté
  accept?: string;
  maxSize?: number;
}

export default function CoverImageUpload({
  cover_image,
  isUploading,
  uploadProgress = 0,
  uploadError = null,
  onImageUpload,
  onImageRemove,
  onUrlChange,
  onDeleteImage,
  accept = "image/*",
  maxSize = 5,
}: CoverImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fonction pour extraire le public_id d'une URL Cloudinary
  const extractPublicId = (url: string): string | null => {
    if (!url || !url.includes("cloudinary.com")) return null;

    try {
      // Exemple: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
      const parts = url.split("/");
      const filename = parts[parts.length - 1];
      const publicId = filename.split(".")[0];
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        const folderParts = parts.slice(uploadIndex + 2, -1);
        return folderParts.length > 0
          ? `${folderParts.join("/")}/${publicId}`
          : publicId;
      }
      return publicId;
    } catch {
      return null;
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSizeBytes = maxSize * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setValidationError(`Format non supporté. Utilisez: ${validTypes.join(", ")}`);
      return false;
    }

    if (file.size > maxSizeBytes) {
      setValidationError(`L'image ne doit pas dépasser ${maxSize} Mo`);
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      toast.error(validationError || "Fichier invalide");
      return;
    }

    await onImageUpload(file);
    // Reset input pour permettre le re-upload du même fichier
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      toast.error(validationError || "Fichier invalide");
      return;
    }

    await onImageUpload(file);
  };

  const handleRemove = async () => {
    if (cover_image && onDeleteImage) {
      setIsDeleting(true);
      try {
        const publicId = extractPublicId(cover_image);
        if (publicId) {
          const deleted = await onDeleteImage(publicId);
          if (deleted) {
            onImageRemove();
          }
        } else {
          // Si ce n'est pas une URL Cloudinary, supprimer directement
          onImageRemove();
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression de l'image");
      } finally {
        setIsDeleting(false);
      }
    } else {
      onImageRemove();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        {(isUploading || uploadProgress > 0) && (
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {uploadProgress}%
          </span>
        )}
      </div>

      {cover_image ? (
        // --- État : image présente ---
        <div className="space-y-3">
          <div
            className="group relative aspect-video overflow-hidden rounded-2xl"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
            }}
          >
            <ProductImage
              src={cover_image}
              alt="Cover"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized={
                cover_image.startsWith("data:") || cover_image.startsWith("blob:")
              }
            />

            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(180deg, rgba(43,41,38,0) 55%, rgba(43,41,38,0.45) 100%)",
              }}
            />

            <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  color: "var(--text-primary)",
                }}
                aria-label="Remplacer l'image"
                title="Remplacer l'image"
                disabled={isUploading || isDeleting}
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  color: "#C2483D",
                }}
                aria-label="Supprimer l'image"
                title="Supprimer l'image"
                disabled={isUploading || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="absolute bottom-3 left-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span
                className="rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md"
                style={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  color: "var(--text-secondary)",
                }}
              >
                Aperçu de la couverture
              </span>
            </div>

            {/* Barre de progression d'upload */}
            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="mt-2 text-sm text-white">
                  Upload en cours... {uploadProgress}%
                </span>
              </div>
            )}

            {/* Indicateur de suppression */}
            {isDeleting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="mt-2 text-sm text-white">Suppression en cours...</span>
              </div>
            )}
          </div>

          {/* Message d'erreur */}
          {(uploadError || validationError) && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
              }}
            >
              <AlertCircle className="w-4 h-4" style={{ color: "#DC2626" }} />
              <p className="text-sm" style={{ color: "#DC2626" }}>
                {uploadError || validationError}
              </p>
            </div>
          )}
        </div>
      ) : (
        // --- État : zone de dépôt ---
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            disabled={isUploading}
            className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl transition-all duration-300 disabled:opacity-50"
            style={{
              backgroundColor: isDragging
                ? "var(--bg-tertiary)"
                : "var(--bg-secondary)",
              border: `1.5px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle at 50% 35%, var(--bg-tertiary) 0%, transparent 70%)",
                opacity: isDragging ? 0 : 0.6,
              }}
            />

            {isUploading ? (
              <>
                <Loader2
                  className="h-9 w-9 animate-spin"
                  style={{ color: "var(--accent)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Upload en cours... {uploadProgress}%
                </span>
                {uploadProgress < 100 && (
                  <div
                    className="w-48 h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--border)" }}
                  >
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${uploadProgress}%`,
                        backgroundColor: "var(--accent)",
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--accent)",
                    transform: isDragging ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <ImagePlus className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div className="flex flex-col items-center gap-1 px-6 text-center">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {isDragging
                      ? "Déposez l'image ici"
                      : "Glissez une image ou cliquez pour parcourir"}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    PNG, JPG, WEBP ou GIF — {maxSize} Mo maximum
                  </span>
                </div>
              </>
            )}
          </button>

          {/* Message d'erreur */}
          {(uploadError || validationError) && (
            <div
              className="flex items-center gap-2 mt-3 p-3 rounded-xl"
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
              }}
            >
              <AlertCircle className="w-4 h-4" style={{ color: "#DC2626" }} />
              <p className="text-sm" style={{ color: "#DC2626" }}>
                {uploadError || validationError}
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading || isDeleting}
      />

      {/* Champ URL secondaire */}
      <div className="relative mt-3">
        <Link2
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
          style={{ color: "var(--text-tertiary)" }}
        />
        <input
          type="url"
          value={cover_image}
          onChange={(e) => onUrlChange(e.target.value)}
          className="w-full rounded-xl py-2.5 pl-9 pr-3 text-sm transition-colors focus:outline-none"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          placeholder="...ou collez une URL d'image"
          disabled={isUploading || isDeleting}
        />
      </div>
    </div>
  );
}
