import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface Emission {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UseEmissionsOptions {
  onError?: (error: any) => void;
}

export function useEmissions(options: UseEmissionsOptions = {}) {
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onError = options.onError;
  const hasLoadedRef = useRef(false);

  const fetchEmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/emissions");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des émissions");
      }
      const data = await response.json();
      setEmissions(data.data || []);
    } catch (error: any) {
      console.error("Erreur fetchEmissions:", error);
      setError(error.message);
      if (onError) {
        onError(error);
      }
      toast.error("Erreur lors du chargement des émissions");
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const createEmission = useCallback(
    async (title: string): Promise<Emission | null> => {
      if (!title || !title.trim()) {
        toast.error("Le nom de l'émission est requis");
        return null;
      }

      const trimmedTitle = title.trim();
      const existing = emissions.find(
        (emission) => emission.title.toLowerCase() === trimmedTitle.toLowerCase(),
      );

      if (existing) {
        toast.success(`L'émission "${trimmedTitle}" est déjà disponible`);
        return existing;
      }

      setIsCreating(true);
      setError(null);

      try {
        const response = await fetch("/api/emissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: trimmedTitle }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors de la création de l'émission",
          );
        }

        const newEmission = await response.json();
        setEmissions((prev) => [...prev, newEmission]);
        toast.success(`Émission "${trimmedTitle}" créée avec succès`);
        return newEmission;
      } catch (error: any) {
        console.error("Erreur createEmission:", error);
        setError(error.message);
        if (onError) {
          onError(error);
        }
        toast.error(error.message || "Erreur lors de la création de l'émission");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [emissions, onError],
  );

  const createAndSelectEmission = useCallback(
    async (title: string): Promise<Emission | null> => {
      const emission = await createEmission(title);
      if (emission) {
        return emission;
      }
      return null;
    },
    [createEmission],
  );

  const getEmissionById = useCallback(
    (id: string): Emission | undefined => {
      return emissions.find((emission) => emission.id === id);
    },
    [emissions],
  );

  const getEmissionName = useCallback(
    (id: string): string => {
      const emission = getEmissionById(id);
      return emission ? emission.title : "";
    },
    [getEmissionById],
  );

  const emissionNames = useMemo(() => {
    return emissions.map((emission) => emission.title);
  }, [emissions]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    fetchEmissions();
  }, [fetchEmissions]);

  return {
    emissions,
    emissionNames,
    isLoading,
    isCreating,
    error,
    fetchEmissions,
    createEmission,
    createAndSelectEmission,
    getEmissionById,
    getEmissionName,
  };
}
