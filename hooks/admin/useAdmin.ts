"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export interface UseAdminOptions<T> {
  resourceKey: readonly string[];
  endpoint: string;
  deleteEndpoint: (id: string) => string;
  itemsPerPage?: number;
  initialSearch?: string;
  initialPage?: number;
  initialFilters?: string[];
  filterItem?: (item: T, searchTerm: string, selectedFilters: string[]) => boolean;
  successMessage: string;
}

export interface UseAdminReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isDeleting: boolean;
  deleteItem: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  successMessage: string | null;
  setSuccessMessage: (message: string | null) => void;
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useAdmin<T>({
  resourceKey,
  endpoint,
  deleteEndpoint,
  itemsPerPage = 25,
  initialSearch = "",
  initialPage = 1,
  initialFilters = [],
  filterItem,
  successMessage: deletionSuccessMessage,
}: UseAdminOptions<T>): UseAdminReturn<T> {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const resourceQuery = useQuery({
    queryKey: resourceKey,
    queryFn: async (): Promise<T[]> => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des données");
      }
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(deleteEndpoint(id), { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: resourceKey });
      setSuccessMessage(deletionSuccessMessage);
    },
  });

  const data = resourceQuery.data ?? [];
  const filteredData = useMemo(() => {
    if (!filterItem) return data;
    return data.filter((item) => filterItem(item, searchTerm, selectedFilters));
  }, [data, filterItem, searchTerm, selectedFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilters]);

  return {
    data: filteredData,
    loading: resourceQuery.isLoading,
    error:
      (resourceQuery.error instanceof Error ? resourceQuery.error.message : null) ??
      (deleteMutation.error instanceof Error ? deleteMutation.error.message : null),
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil(filteredData.length / itemsPerPage),
    totalItems: filteredData.length,
    itemsPerPage,
    isDeleting: deleteMutation.isPending,
    deleteItem: (id: string) => deleteMutation.mutateAsync(id),
    refetch: async () => {
      await resourceQuery.refetch();
    },
    successMessage,
    setSuccessMessage,
    selectedFilters,
    setSelectedFilters,
  };
}
