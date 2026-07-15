// hooks/blog/book/useBook.ts
"use client";

import { useCategories } from "@/hooks/blog/post/useCategories";
import { useTags } from "@/hooks/blog/post/useTags";
import { CreateBookSchema } from "@/lib/validation/schemas";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

interface BookFormData {
  title: string;
  synopsis?: string;
  cover_image?: string;
  file_url?: string;
  price?: number | null;
  category_id?: string | null;
  tag_ids: string[];
  status: "DRAFT" | "PUBLISHED";
}

interface UseBookOptions {
  onSuccess?: (book: any) => void;
  onError?: (error: Error) => void;
}

export function useBook(options: UseBookOptions = {}) {
  const categories = useCategories();
  const tags = useTags();

  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    synopsis: "",
    cover_image: "",
    file_url: "",
    price: null,
    category_id: null,
    tag_ids: [],
    status: "DRAFT",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const updateField = useCallback(
    (field: keyof BookFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (hasAttemptedSubmit) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [hasAttemptedSubmit],
  );

  const validateForm = useCallback(() => {
    const result = CreateBookSchema.safeParse({
      title: formData.title,
      synopsis: formData.synopsis,
      coverImage: formData.cover_image,
      fileUrl: formData.file_url || "",
      categoryId: formData.category_id,
      tags: formData.tag_ids,
      status: formData.status,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0];
        if (path) {
          fieldErrors[path.toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setHasAttemptedSubmit(true);

      if (!validateForm()) {
        toast.error("Veuillez corriger les erreurs du formulaire");
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/books", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            synopsis: formData.synopsis?.trim() || "",
            coverImage: formData.cover_image || null,
            fileUrl: formData.file_url || null,
            price: formData.price || null,
            categoryId: formData.category_id || null,
            tagIds: formData.tag_ids || [],
            status: formData.status,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors de la création du livre");
        }

        toast.success(
          formData.status === "PUBLISHED"
            ? "Livre publié avec succès !"
            : "Brouillon enregistré avec succès !",
        );

        options.onSuccess?.(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erreur inconnue";
        setErrors((prev) => ({ ...prev, submit: message }));
        options.onError?.(error as Error);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, options],
  );

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      synopsis: "",
      cover_image: "",
      file_url: "",
      price: null,
      category_id: null,
      tag_ids: [],
      status: "DRAFT",
    });
    setErrors({});
    setHasAttemptedSubmit(false);
  }, []);

  const isValid = !Object.keys(errors).some((key) => errors[key]);

  return {
    formData,
    updateField,
    handleSubmit,
    isSubmitting,
    categories,
    tags,
    isValid,
    errors,
    resetForm,
    hasAttemptedSubmit,
  };
}
