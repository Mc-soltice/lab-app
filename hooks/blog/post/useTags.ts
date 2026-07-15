// hooks/blog/useTags.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseTagsOptions {
  onError?: (error: any) => void;
}

export function useTags(options: UseTagsOptions = {}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onError = options.onError;
  const hasLoadedRef = useRef(false);

  // Récupérer tous les tags
  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des tags");
      }
      const data = await response.json();
      setTags(data.data || []);
    } catch (error: any) {
      console.error("Erreur fetchTags:", error);
      setError(error.message);
      if (onError) {
        onError(error);
      }
      toast.error("Erreur lors du chargement des tags");
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Créer un nouveau tag
  const createTag = useCallback(
    async (name: string): Promise<Tag | null> => {
      if (!name || !name.trim()) {
        toast.error("Le nom du tag est requis");
        return null;
      }

      const trimmedName = name.trim();

      // Vérifier si le tag existe déjà
      const existing = tags.find(
        (t) => t.name.toLowerCase() === trimmedName.toLowerCase(),
      );
      if (existing) {
        toast.success(`Le tag "${trimmedName}" existe déjà`);
        return existing;
      }

      setIsCreating(true);
      setError(null);

      try {
        const response = await fetch("/api/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: trimmedName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la création du tag",
          );
        }

        const newTag = await response.json();
        setTags((prev) => [...prev, newTag]);
        toast.success(`Tag "${trimmedName}" créé avec succès`);
        return newTag;
      } catch (error: any) {
        console.error("Erreur createTag:", error);
        setError(error.message);
        if (onError) {
          onError(error);
        }
        toast.error(error.message || "Erreur lors de la création du tag");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [tags, onError],
  );

  // Créer et sélectionner un tag en une seule opération
  const createAndSelectTag = useCallback(
    async (name: string): Promise<Tag | null> => {
      const tag = await createTag(name);
      return tag;
    },
    [createTag],
  );

  // Obtenir un tag par son ID
  const getTagById = useCallback(
    (id: string): Tag | undefined => {
      return tags.find((t) => t.id === id);
    },
    [tags],
  );

  // Obtenir un tag par son nom
  const getTagByName = useCallback(
    (name: string): Tag | undefined => {
      return tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    },
    [tags],
  );

  // Ajouter un tag à la sélection
  const selectTag = useCallback(
    (
      tagId: string,
      selectedTags: string[],
      setSelectedTags: (ids: string[]) => void,
    ) => {
      if (!selectedTags.includes(tagId)) {
        setSelectedTags([...selectedTags, tagId]);
      }
    },
    [],
  );

  // Retirer un tag de la sélection
  const removeTag = useCallback(
    (
      tagId: string,
      selectedTags: string[],
      setSelectedTags: (ids: string[]) => void,
    ) => {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    },
    [],
  );

  // Vérifier si un tag est sélectionné
  const isTagSelected = useCallback(
    (tagId: string, selectedTags: string[]): boolean => {
      return selectedTags.includes(tagId);
    },
    [],
  );

  // Obtenir les noms de tous les tags
  const tagNames = useMemo(() => {
    return tags.map((t) => t.name);
  }, [tags]);

  // Charger les tags au montage
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchTags();
  }, [fetchTags]);

  return {
    // Données
    tags,
    tagNames,
    isLoading,
    isCreating,
    error,

    // Actions
    fetchTags,
    createTag,
    createAndSelectTag,
    getTagById,
    getTagByName,
    selectTag,
    removeTag,
    isTagSelected,
  };
}
