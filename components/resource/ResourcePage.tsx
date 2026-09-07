"use client";

import FilterHeader, { FilterToggleGroup } from "@/components/ui/FilterHeader";
import { GenericTable } from "@/components/ui/GenericTable";
import SuccessModal from "@/components/ui/SuccessModal";
import { useAdmin } from "@/hooks/admin/useAdmin";
import { resourceRegistry } from "@/resources/registry";
import type { ResourceDefinition } from "@/resources/types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResourcePage({ resource }: { resource: string }) {
  const config = resourceRegistry[resource] as ResourceDefinition | undefined;
  if (!config) return <div className="p-6">Ressource introuvable.</div>;
  return <ResourceContent config={config} />;
}

function ResourceContent({ config }: { config: ResourceDefinition }) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const state = useAdmin({ ...config.admin });
  const selectedFilters = state.selectedFilters;

  const toggleFilter = (id: string) => {
    state.setSelectedFilters((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const activeFilters = selectedFilters.map((id) => ({
    label:
      config.filterGroups
        ?.flatMap((group) => group.filters)
        .find((filter) => filter.id === id)?.label ?? id,
    onRemove: () => toggleFilter(id),
  }));

  return (
    <div className="p-6 space-y-6">
      <FilterHeader
        title={config.title}
        description={`${state.totalItems} ${config.singular}${state.totalItems > 1 ? "s" : ""} au total`}
        actionLabel={config.actionLabel}
        actionIcon={<Plus className="w-4 h-4" />}
        onAction={() => router.push(config.createPath)}
        searchValue={state.searchTerm}
        onSearchChange={state.setSearchTerm}
        searchPlaceholder={config.searchPlaceholder}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((current) => !current)}
        activeFilterCount={selectedFilters.length}
        onClearFilters={() => {
          state.setSelectedFilters([]);
          setShowFilters(false);
        }}
        activeFilters={activeFilters}
      >
        {config.filterGroups?.map((group) => (
          <FilterToggleGroup
            key={group.label}
            label={group.label}
            filters={group.filters}
            selectedFilters={selectedFilters}
            onToggleFilter={toggleFilter}
          />
        ))}
      </FilterHeader>

      {state.error ? (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
          <p className="font-medium">Erreur</p>
          <p className="text-sm">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <GenericTable
          data={state.data}
          columns={config.columns}
          titleField={config.titleField}
          onDelete={(id) => state.deleteItem(String(id))}
          onView={(id) => router.push(`${config.detailPath}/${id}`)}
          isLoading={state.loading || state.isDeleting}
          itemsPerPage={state.itemsPerPage}
          emptyMessage={config.emptyMessage}
        />
      )}
      <SuccessModal
        isOpen={!!state.successMessage}
        title="Succès !"
        description={state.successMessage || ""}
        onClose={() => state.setSuccessMessage(null)}
      />
    </div>
  );
}
