// hooks/blog/useCategories.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UseCategoriesOptions {
  onError?: (error: any) => void;
}

export function useCategories(options: UseCategoriesOptions = {}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onError = options.onError;
  const hasLoadedRef = useRef(false);

  // Récupérer toutes les catégories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des catégories");
      }
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error: any) {
      console.error("Erreur fetchCategories:", error);
      setError(error.message);
      if (onError) {
        onError(error);
      }
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Créer une nouvelle catégorie
  const createCategory = useCallback(
    async (name: string): Promise<Category | null> => {
      if (!name || !name.trim()) {
        toast.error("Le nom de la catégorie est requis");
        return null;
      }

      const trimmedName = name.trim();

      // Vérifier si la catégorie existe déjà
      const existing = categories.find(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase(),
      );
      if (existing) {
        toast.success(`La catégorie "${trimmedName}" est déjà disponible`);
        return existing;
      }

      setIsCreating(true);
      setError(null);

      try {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: trimmedName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la création de la catégorie",
          );
        }

        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        toast.success(`Catégorie "${trimmedName}" créée avec succès`);
        return newCategory;
      } catch (error: any) {
        console.error("Erreur createCategory:", error);
        setError(error.message);
        if (onError) {
          onError(error);
        }
        toast.error(
          error.message || "Erreur lors de la création de la catégorie",
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [categories, onError],
  );

  // Créer et sélectionner une catégorie en une seule opération
  const createAndSelectCategory = useCallback(
    async (name: string): Promise<Category | null> => {
      const category = await createCategory(name);
      if (category) {
        return category;
      }
      return null;
    },
    [createCategory],
  );

  // Obtenir une catégorie par son ID
  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((c) => c.id === id);
    },
    [categories],
  );

  // Obtenir le nom d'une catégorie par son ID
  const getCategoryName = useCallback(
    (id: string): string => {
      const category = getCategoryById(id);
      return category ? category.name : "";
    },
    [getCategoryById],
  );

  // Obtenir les noms de toutes les catégories
  const categoryNames = useMemo(() => {
    return categories.map((c) => c.name);
  }, [categories]);

  // Charger les catégories au montage
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchCategories();
  }, [fetchCategories]);

  return {
    // Données
    categories,
    categoryNames,
    isLoading,
    isCreating,
    error,

    // Actions
    fetchCategories,
    createCategory,
    createAndSelectCategory,
    getCategoryById,
    getCategoryName,
  };
}
