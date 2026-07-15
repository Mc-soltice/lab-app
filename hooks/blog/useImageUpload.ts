// hooks/blog/useImageUpload.ts
"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (
      file: File,
      folder: string = "blog/posts",
      resourceType: string = "image",
    ): Promise<string | null> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        console.log("📤 Uploading:", file.name);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        formData.append("resourceType", resourceType);

        const xhr = new XMLHttpRequest();

        // Suivi de la progression
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
            console.log("📊 Progression:", percent + "%");
          }
        });

        const uploadPromise = new Promise<string>((resolve, reject) => {
          xhr.addEventListener("load", () => {
            console.log("📥 Réponse reçue:", xhr.status);

            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                console.log("✅ Upload réussi:", response.data.secure_url);
                resolve(response.data.secure_url);
              } catch (e) {
                reject(new Error("Erreur de parsing JSON"));
              }
            } else {
              try {
                const error = JSON.parse(xhr.responseText);
                reject(new Error(error.error || "Erreur lors de l'upload"));
              } catch (e) {
                reject(new Error("Erreur lors de l'upload"));
              }
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Erreur réseau"));
          });

          xhr.open("POST", "/api/upload");
          xhr.send(formData);
        });

        const uploadedUrl = await uploadPromise;
        setProgress(100);
        toast.success(
          resourceType === "raw"
            ? "Fichier PDF uploadé avec succès"
            : "Image uploadée avec succès",
        );
        return uploadedUrl;
      } catch (error) {
        console.error("❌ Erreur upload:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erreur lors de l'upload";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const deleteImage = useCallback(
    async (publicId: string): Promise<boolean> => {
      try {
        console.log("🗑️ Suppression:", publicId);

        const response = await fetch(`/api/upload?publicId=${publicId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression");
        }

        toast.success("Image supprimée");
        return true;
      } catch (error) {
        console.error("❌ Erreur suppression:", error);
        toast.error("Erreur lors de la suppression");
        return false;
      }
    },
    [],
  );

  const uploadImage = useCallback(
    async (
      file: File,
      folder: string = "blog/posts",
    ): Promise<string | null> => {
      return uploadFile(file, folder, "image");
    },
    [uploadFile],
  );

  return {
    uploadImage,
    uploadFile,
    deleteImage,
    isUploading,
    progress,
    error,
  };
}
