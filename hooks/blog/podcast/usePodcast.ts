// hooks/blog/podcast/usePodcast.ts
import { useAuthContext } from "@/contexts/auth/auth.context";
import { useCategories } from "@/hooks/blog/post/useCategories";
import { useTags } from "@/hooks/blog/post/useTags";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

export interface PodcastFormData {
  title: string;
  description: string;
  audioUrl: string;
  coverImage: string;
  duration: number;
  transcript: string;
  categoryId: string;
  tagIds: string[];
  status: "DRAFT" | "PUBLISHED";
}

export interface PodcastFormErrors {
  title?: string;
  description?: string;
  audioUrl?: string;
  duration?: string;
  category?: string;
  tags?: string;
  submit?: string;
}

interface UsePodcastOptions {
  initialData?: Partial<PodcastFormData>;
  onSuccess?: (podcast: any) => void;
  onError?: (error: any) => void;
}

const initialFormData: PodcastFormData = {
  title: "",
  description: "",
  audioUrl: "",
  coverImage: "",
  duration: 0,
  transcript: "",
  categoryId: "",
  tagIds: [],
  status: "DRAFT",
};
// Validation URL audio
const isValidAudioUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
export function usePodcast(options: UsePodcastOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [formData, setFormData] = useState<PodcastFormData>({
    ...initialFormData,
    ...options.initialData,
  });

  // Utiliser les hooks de catégories et tags
  const categories = useCategories();
  const tags = useTags();

  // Validation
  const errors = useMemo<PodcastFormErrors>(() => {
    const errors: PodcastFormErrors = {};

    if (hasAttemptedSubmit || formData.title.trim()) {
      if (!formData.title.trim()) {
        errors.title = "Le titre est requis";
      } else if (formData.title.length < 3) {
        errors.title = "Le titre doit contenir au moins 3 caractères";
      } else if (formData.title.length > 200) {
        errors.title = "Le titre ne doit pas dépasser 200 caractères";
      }
    }

    if (hasAttemptedSubmit || formData.description?.trim()) {
      if (!formData.description?.trim()) {
        errors.description = "La description est requise";
      } else if (formData.description.length < 10) {
        errors.description =
          "La description doit contenir au moins 10 caractères";
      }
    }

    if (hasAttemptedSubmit || formData.audioUrl.trim()) {
      if (!formData.audioUrl.trim()) {
        errors.audioUrl = "Le fichier audio est requis";
      } else if (!isValidAudioUrl(formData.audioUrl)) {
        errors.audioUrl = "URL audio invalide";
      }
    }

    if (formData.duration > 0 && formData.duration < 30) {
      errors.duration = "La durée minimale est de 30 secondes";
    }

    if (hasAttemptedSubmit) {
      if (!formData.categoryId) {
        errors.category = "Veuillez sélectionner une catégorie";
      }
      if (!formData.tagIds || formData.tagIds.length === 0) {
        errors.tags = "Veuillez sélectionner au moins un tag";
      }
    }

    return errors;
  }, [formData, hasAttemptedSubmit]);

  const isValid = useMemo(() => {
    return (
      formData.title.trim().length >= 3 &&
      formData.title.trim().length <= 200 &&
      formData.description?.trim().length >= 10 &&
      !!formData.audioUrl.trim() &&
      isValidAudioUrl(formData.audioUrl) &&
      !!formData.categoryId &&
      (formData.tagIds?.length || 0) > 0
    );
  }, [formData]);

  // Mettre à jour un champ du formulaire
  const updateField = useCallback(
    <K extends keyof PodcastFormData>(field: K, value: PodcastFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );
  // Fonction pour mettre à jour l'audio avec durée
  const updateAudio = useCallback(
    (url: string, duration?: number) => {
      updateField("audioUrl", url);
      if (duration !== undefined && duration > 0) {
        updateField("duration", duration);
      }
    },
    [updateField],
  );
  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setFormData({ ...initialFormData });
    setHasAttemptedSubmit(false);
  }, []);

  // Soumettre le formulaire
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setHasAttemptedSubmit(true);

      if (!isValid) {
        toast.error("Veuillez corriger les erreurs du formulaire");
        return;
      }

      if (!isAuthenticated) {
        toast.error("Vous devez être connecté pour publier un podcast");
        return;
      }

      setIsSubmitting(true);

      try {
        // Préparer les données pour l'API
        const podcastData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          audioUrl: formData.audioUrl.trim(),
          coverImage: formData.coverImage || undefined,
          duration: formData.duration,
          transcript: formData.transcript?.trim() || undefined,
          categoryId: formData.categoryId,
          tags: formData.tagIds,
          status: formData.status,
        };

        const response = await fetch("/api/podcasts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(podcastData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la création du podcast",
          );
        }

        const result = await response.json();

        toast.success(
          formData.status === "PUBLISHED"
            ? "Podcast publié avec succès !"
            : "Brouillon enregistré avec succès !",
        );

        if (options.onSuccess) {
          options.onSuccess(result);
        } else {
          router.push(`/podcasts/${result.slug}`);
        }

        resetForm();
      } catch (error: any) {
        console.error("Erreur lors de la soumission:", error);
        toast.error(error.message || "Erreur lors de la création du podcast");

        if (options.onError) {
          options.onError(error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isValid, isAuthenticated, router, options, resetForm],
  );

  return {
    //duree de l'audio
    updateAudio,
    // Données du formulaire
    formData,
    updateField,
    resetForm,

    // États de soumission
    handleSubmit,
    isSubmitting,
    hasAttemptedSubmit,

    // Validation
    errors,
    isValid,

    // Catégories
    categories: {
      ...categories,
      selectedCategoryId: formData.categoryId,
      setSelectedCategoryId: (id: string) => updateField("categoryId", id),
      getCategoryName: categories.getCategoryName,
    },

    // Tags
    tags: {
      ...tags,
      selectedTagIds: formData.tagIds,
      setSelectedTagIds: (ids: string[]) => updateField("tagIds", ids),
      selectedTagNames: tags.tagNames.filter((name) =>
        formData.tagIds.some((id) => tags.getTagByName(name)?.id === id),
      ),
    },

    // Utilitaires
    isLoading: categories.isLoading || tags.isLoading,
  };
}
