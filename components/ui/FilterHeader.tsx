"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import type { ReactNode } from "react";

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
  children?: ReactNode;
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
  children,
}: FilterHeaderProps) {
  const actionButton = (
    <button
      type="button"
      onClick={onAction}
      className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 flex items-center gap-2"
      style={{
        backgroundColor: "var(--accent)",
        color: "var(--text-primary)",
      }}
    >
      {actionIcon}
      {actionLabel}
    </button>
  );

  return (
    <div className="mb-8 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          )}
        </div>

        {onAction && actionLabel ? (
          actionButton
        ) : actionHref ? (
          <a
            href={actionHref}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 flex items-center gap-2"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-primary)",
            }}
          >
            {actionIcon}
            {actionLabel}
          </a>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {onToggleFilters && (
            <button
              type="button"
              onClick={onToggleFilters}
              className="px-4 py-2.5 rounded-xl border text-sm transition-colors flex items-center gap-2 shrink-0"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <Filter className="h-4 w-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span
                  className="ml-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--text-primary)",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {activeFilterCount > 0 && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1 shrink-0"
              style={{ color: "var(--text-tertiary)" }}
            >
              <X className="h-4 w-4" />
              Effacer
            </button>
          )}
        </div>

        {showFilters !== undefined && (
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                  }}
                >
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
