"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface ActiveFilter {
  label: string;
  onRemove: () => void;
}

interface FilterHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  actionHref?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  activeFilters?: ActiveFilter[];
  children?: ReactNode;
}

// Nouveau composant pour les boutons de filtre à bascule
interface FilterToggleButtonProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  count?: number;
  icon?: ReactNode;
}

export function FilterToggleButton({
  label,
  isSelected,
  onToggle,
  count,
  icon,
}: FilterToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
        flex items-center gap-2 border-2 
        ${
          isSelected
            ? "bg-linear-to-r from-amber-500 to-rose-500 text-white border-transparent shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            : "bg-white/80 backdrop-blur-sm text-gray-700 border-amber-100/50 hover:border-amber-300 hover:bg-amber-50/50"
        }
        active:scale-95 cursor-pointer
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`
            ml-1 px-2 py-0.5 rounded-full text-xs 
            ${
              isSelected
                ? "bg-white/20 text-white"
                : "bg-amber-100 text-amber-700"
            }
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Composant pour un groupe de filtres à bascule
interface FilterToggleGroupProps {
  filters: Array<{
    id: string;
    label: string;
    count?: number;
    icon?: ReactNode;
  }>;
  selectedFilters: string[];
  onToggleFilter: (filterId: string) => void;
  label?: string;
}

export function FilterToggleGroup({
  filters,
  selectedFilters,
  onToggleFilter,
  label,
}: FilterToggleGroupProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <FilterToggleButton
            key={filter.id}
            label={filter.label}
            isSelected={selectedFilters.includes(filter.id)}
            onToggle={() => onToggleFilter(filter.id)}
            count={filter.count}
            icon={filter.icon}
          />
        ))}
      </div>
    </div>
  );
}

export default function FilterHeader({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  actionHref,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  showFilters,
  onToggleFilters,
  activeFilterCount = 0,
  onClearFilters,
  activeFilters = [],
  children,
}: FilterHeaderProps) {
  const ActionButton = () => {
    const className = `px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95 flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 bg-linear-to-r from-amber-500 to-rose-500 text-white`;

    if (onAction) {
      return (
        <button type="button" onClick={onAction} className={className}>
          {actionIcon}
          {actionLabel}
        </button>
      );
    }

    if (actionHref) {
      return (
        <Link href={actionHref} className={className}>
          {actionIcon}
          {actionLabel}
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="mb-8 space-y-5">
      {/* En-tête principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-rose-600">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>

        {actionLabel && <ActionButton />}
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Champ de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-100/50 bg-white/80 backdrop-blur-sm text-gray-800 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 placeholder:text-gray-400"
            />
          </div>

          {/* Groupe de boutons */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleFilters && (
              <button
                type="button"
                onClick={onToggleFilters}
                className={`relative px-4 py-2.5 rounded-xl border text-sm transition-all hover:opacity-80 active:scale-95 flex items-center gap-2 ${
                  showFilters
                    ? "bg-linear-to-r from-amber-100 to-rose-100 border-amber-300 text-amber-800 shadow-md"
                    : "bg-white/80 backdrop-blur-sm border-amber-100/50 text-gray-700 hover:bg-amber-50/50 hover:text-amber-700"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtres</span>
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-linear-to-r from-amber-500 to-rose-500 text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {activeFilterCount > 0 && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="px-3 py-2.5 rounded-xl text-sm transition-all hover:opacity-70 active:scale-95 flex items-center gap-1.5 shrink-0 text-gray-400 hover:text-amber-600"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Effacer</span>
              </button>
            )}
          </div>
        </div>

        {/* Panneau des filtres avancés */}
        {showFilters !== undefined && (
          <AnimatePresence mode="wait">
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-5 rounded-xl border border-amber-100/50 bg-white/80 backdrop-blur-sm">
                  <div className="flex flex-wrap items-end gap-4">
                    {children}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Résumé des filtres actifs avec couleurs ambre-rose */}
        {activeFilterCount > 0 && activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 rounded-lg bg-gray-50/80">
            <span className="text-sm text-gray-500">Filtres actifs :</span>
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-linear-to-r from-amber-500/20 to-rose-500/20 text-amber-800 border border-amber-200/50"
              >
                {filter.label}
                <button
                  onClick={filter.onRemove}
                  className="hover:opacity-70 transition-opacity"
                  aria-label={`Supprimer le filtre ${filter.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="ml-auto text-xs font-medium hover:opacity-70 transition-opacity text-gray-500"
              >
                Tout effacer
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
