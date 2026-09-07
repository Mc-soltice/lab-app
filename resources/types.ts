import type { ColumnConfig } from "@/components/ui/GenericTable";

export interface AdminResourceConfig<T> {
  resourceKey: readonly string[];
  endpoint: string;
  deleteEndpoint: (id: string) => string;
  successMessage: string;
  filterItem: (item: T, searchTerm: string, selectedFilters: string[]) => boolean;
}

export interface ResourceFilter {
  id: string;
  label: string;
}

export interface ResourceFilterGroup {
  label: string;
  filters: ResourceFilter[];
}

export interface ResourceDefinition<T = any> {
  title: string;
  singular: string;
  actionLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
  detailPath: string;
  createPath: string;
  titleField: string;
  columns: ColumnConfig<T>[];
  filterGroups?: ResourceFilterGroup[];
  admin: AdminResourceConfig<T>;
}
