// hooks/blog/usePost.ts
import { useAuthContext } from "@/contexts/auth/auth.context";
import { useCategories } from "@/hooks/blog/post/useCategories";
import { useTags } from "@/hooks/blog/post/useTags";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category_id: string;
  tag_ids: string[];
  published: boolean;
}

export interface PostFormErrors {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string;
  submit?: string;
}

interface UsePostOptions {
  initialData?: Partial<PostFormData>;
  onSuccess?: (post: any) => void;
  onError?: (error: any) => void;
}

const initialFormData: PostFormData = {
  title: "",
  content: "",
  excerpt: "",
  cover_image: "",
  category_id: "",
  tag_ids: [],
  published: false,
};

export function usePost(options: UsePostOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [formData, setFormData] = useState<PostFormData>({
    ...initialFormData,
    ...options.initialData,
  });

  // Utiliser les hooks de catégories et tags
  const categories = useCategories();
  const tags = useTags();

  // Validation
  const errors = useMemo<PostFormErrors>(() => {
    const errors: PostFormErrors = {};

    if (hasAttemptedSubmit || formData.title.trim()) {
      if (!formData.title.trim()) {
        errors.title = "Le titre est requis";
      } else if (formData.title.length < 3) {
        errors.title = "Le titre doit contenir au moins 3 caractères";
      } else if (formData.title.length > 200) {
        errors.title = "Le titre ne doit pas dépasser 200 caractères";
      }
    }

    if (hasAttemptedSubmit || formData.content.trim()) {
      if (!formData.content.trim()) {
        errors.content = "Le contenu est requis";
      } else if (formData.content.length < 10) {
        errors.content = "Le contenu doit contenir au moins 10 caractères";
      }
    }

    if (formData.excerpt && formData.excerpt.length > 160) {
      errors.excerpt = "L'extrait ne doit pas dépasser 160 caractères";
    }

    if (hasAttemptedSubmit) {
      if (!formData.category_id) {
        errors.category = "Veuillez sélectionner une catégorie";
      }
      if (!formData.tag_ids || formData.tag_ids.length === 0) {
        errors.tags = "Veuillez sélectionner au moins un tag";
      }
    }

    return errors;
  }, [formData, hasAttemptedSubmit]);

  const isValid = useMemo(() => {
    return (
      formData.title.trim().length >= 3 &&
      formData.title.trim().length <= 200 &&
      formData.content.trim().length >= 10 &&
      (!formData.excerpt || formData.excerpt.length <= 160) &&
      !!formData.category_id &&
      (formData.tag_ids?.length || 0) > 0
    );
  }, [formData]);

  // Mettre à jour un champ du formulaire
  const updateField = useCallback(
    <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
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
        toast.error("Vous devez être connecté pour publier un article");
        return;
      }

      setIsSubmitting(true);

      try {
        // Préparer les données pour l'API
        const postData = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt:
            formData.excerpt?.trim() ||
            formData.content.trim().substring(0, 160),
          coverImage: formData.cover_image || undefined,
          categoryId: formData.category_id,
          tags: formData.tag_ids,
          status: formData.published ? "PUBLISHED" : "DRAFT",
        };

        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la création du post",
          );
        }

        const result = await response.json();

        toast.success(
          formData.published
            ? "Article publié avec succès !"
            : "Brouillon enregistré avec succès !",
        );

        if (options.onSuccess) {
          options.onSuccess(result);
        } else {
          // Rediriger vers l'article ou le tableau de bord
          router.push(`/blog/posts/${result.slug}`);
        }

        resetForm();
      } catch (error: any) {
        console.error("Erreur lors de la soumission:", error);
        toast.error(error.message || "Erreur lors de la création du post");

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
      selectedCategoryId: formData.category_id,
      setSelectedCategoryId: (id: string) => updateField("category_id", id),
      getCategoryName: categories.getCategoryName,
    },

    // Tags
    tags: {
      ...tags,
      selectedTagIds: formData.tag_ids,
      setSelectedTagIds: (ids: string[]) => updateField("tag_ids", ids),
      selectedTagNames: tags.tagNames.filter((name) =>
        formData.tag_ids.some((id) => tags.getTagByName(name)?.id === id),
      ),
    },

    // Utilitaires
    isLoading: categories.isLoading || tags.isLoading,
  };
}
