"use client";

import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const c = {
  card: "#0D0F14",
  surface: "#14171D",
  border: "#1E212A",
  borderSubtle: "#181B22",
  textPrimary: "#F3F4F6",
  textSecondary: "#9A9DA8",
  textMuted: "#6B6E79",
  accent: "#2DD4BF",
  accentSoft: "rgba(45, 212, 191, 0.12)",
  rowHover: "#14181F",
  dangerSoft: "rgba(242, 109, 109, 0.10)",
};

const IMAGE_SIZE_MAP = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950";

export interface ColumnConfig<T> {
  key: string;
  label: string;
  type?: "text" | "image" | "badge" | "date";
  render?: (item: T) => React.ReactNode;
  imageField?: string;
  imageAltField?: string;
  imageSize?: "sm" | "md" | "lg";
  badgeColors?: Record<string, string>;
}

type TableDensity = "comfortable" | "compact";
type SortDirection = "asc" | "desc" | null;

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  titleField?: string;
  onDelete?: (id: string | number) => void;
  onView?: (id: string | number) => void;
  isLoading?: boolean;
  itemsPerPage?: number;
  emptyMessage?: string;
  defaultDensity?: TableDensity;
  allowColumnToggle?: boolean;
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GenericTable<T extends { id: string | number }>({
  data,
  columns,
  titleField,
  onDelete,
  onView,
  isLoading = false,
  itemsPerPage = 10,
  emptyMessage = "Aucune donnée",
  defaultDensity = "comfortable",
  allowColumnToggle = true,
}: GenericTableProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selected, setSelected] = useState<Set<T["id"]>>(new Set());
  const [hoveredRowId, setHoveredRowId] = useState<T["id"] | null>(null);
  const [activeRowId, setActiveRowId] = useState<T["id"] | null>(null);
  const [rowMenuPosition, setRowMenuPosition] = useState({ top: 0, left: 0 });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    () => Object.fromEntries(columns.map((column) => [column.key, true])),
  );

  useEffect(() => {
    setColumnVisibility((current) => {
      const next = { ...current };
      columns.forEach((column) => {
        if (!(column.key in next)) next[column.key] = true;
      });
      return next;
    });
  }, [columns]);

  const activeColumns = useMemo(() => {
    const visible = columns.filter((column) => columnVisibility[column.key] !== false);
    return visible.length > 0 ? visible : columns;
  }, [columns, columnVisibility]);

  const statusColumn = columns.find((column) =>
    ["status", "statut"].includes(column.key.toLowerCase()),
  );
  const statusOptions = useMemo(() => {
    if (!statusColumn) return [];
    return Array.from(
      new Set(
        data
          .map((item) => getNestedValue(item, statusColumn.key))
          .filter((value): value is string | number => value != null)
          .map(String),
      ),
    ).sort((left, right) => left.localeCompare(right, "fr", { sensitivity: "base" }));
  }, [data, statusColumn]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter(
      (item) =>
        (query.length === 0 ||
          activeColumns.some((column) => {
            const value = getNestedValue(item, column.key);
            return value != null && String(value).toLowerCase().includes(query);
          })) &&
        (!statusColumn ||
          selectedStatuses.size === 0 ||
          selectedStatuses.has(String(getNestedValue(item, statusColumn.key)))),
    );
  }, [activeColumns, data, search, selectedStatuses, statusColumn]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDirection) return filtered;
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((left, right) => {
      const a = getNestedValue(left, sortKey);
      const b = getNestedValue(right, sortKey);
      return (
        String(a ?? "").localeCompare(String(b ?? ""), "fr", {
          numeric: true,
          sensitivity: "base",
        }) * direction
      );
    });
  }, [filtered, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const rows = sorted.slice(start, start + itemsPerPage);
  const cellPadding = density === "compact" ? "py-2" : "py-3";
  const selectableIds = data.map((item) => item.id);
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
  }

  function toggleSelection(id: T["id"]) {
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleStatus(status: string) {
    setSelectedStatuses((current) => {
      const next = new Set(current);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
    setPage(1);
  }

  function openRowMenu(event: React.SyntheticEvent<HTMLTableRowElement>, id: T["id"]) {
    if (!onView && !onDelete) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setRowMenuPosition({
      top: Math.min(rect.bottom + 4, window.innerHeight - 112),
      left: Math.min(rect.left + 16, window.innerWidth - 220),
    });
    setActiveRowId(id);
  }

  function closeRowMenu() {
    setActiveRowId(null);
  }

  function renderCell(item: T, column: ColumnConfig<T>): React.ReactNode {
    if (column.render) return column.render(item);
    const value = getNestedValue(item, column.key);

    if (column.type === "image") {
      const src = column.imageField ? getNestedValue(item, column.imageField) : value;
      const alt = column.imageAltField
        ? String(getNestedValue(item, column.imageAltField) ?? "")
        : "";
      if (!src) {
        return (
          <div
            className={`${IMAGE_SIZE_MAP[column.imageSize ?? "md"]} flex items-center justify-center rounded-lg`}
            style={{ backgroundColor: c.surface, color: c.textMuted }}
          >
            <span className="text-xs">N/A</span>
          </div>
        );
      }
      return (
        <img
          src={String(src)}
          alt={alt}
          className={`${IMAGE_SIZE_MAP[column.imageSize ?? "md"]} rounded-lg border object-cover`}
          style={{ borderColor: c.border }}
        />
      );
    }

    if (column.type === "badge" && column.badgeColors) {
      const colorClass =
        column.badgeColors[String(value)] ?? "bg-white/5 text-neutral-400";
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass}`}
        >
          {String(value ?? "")}
        </span>
      );
    }

    if (column.type === "date" && value)
      return (
        <span style={{ color: c.textSecondary }}>{formatDate(String(value))}</span>
      );
    return <span style={{ color: c.textSecondary }}>{String(value ?? "")}</span>;
  }

  return (
    <div
      className="min-w-0 w-full max-w-full overflow-hidden rounded-xl border"
      style={{ backgroundColor: c.card, borderColor: c.border }}
    >
      <div
        className="flex min-w-0 max-w-full flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center"
        style={{ borderColor: c.border }}
      >
        <div className="relative min-w-0 w-full sm:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: c.textMuted }}
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Rechercher…"
            aria-label="Rechercher dans le tableau"
            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm ${FOCUS_RING}`}
            style={{
              backgroundColor: c.surface,
              borderColor: c.border,
              color: c.textPrimary,
            }}
          />
        </div>
        <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
          {statusColumn && statusOptions.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((open) => !open)}
                aria-expanded={statusOpen}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${FOCUS_RING}`}
                style={{
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  color: selectedStatuses.size > 0 ? c.accent : c.textSecondary,
                }}
              >
                Statut
                {selectedStatuses.size > 0 && (
                  <span className="text-xs">{selectedStatuses.size}</span>
                )}
                <ChevronDown className="h-3.5 w-3.5" style={{ color: c.textMuted }} />
              </button>
              {statusOpen && (
                <>
                  <button
                    className="fixed inset-0 z-30 cursor-default"
                    aria-label="Fermer le filtre de statut"
                    onClick={() => setStatusOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full z-40 mt-2 min-w-48 rounded-lg border p-2 shadow-xl"
                    style={{ backgroundColor: c.surface, borderColor: c.border }}
                  >
                    {statusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                        style={{ color: c.textSecondary }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.has(status)}
                          onChange={() => toggleStatus(status)}
                          className="h-3.5 w-3.5 accent-teal-400"
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div
            className="inline-flex rounded-lg border p-0.5"
            style={{ borderColor: c.border, backgroundColor: c.surface }}
          >
            {(["comfortable", "compact"] as TableDensity[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDensity(option)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${FOCUS_RING}`}
                style={
                  density === option
                    ? { backgroundColor: c.accentSoft, color: c.accent }
                    : { color: c.textMuted }
                }
              >
                {option === "comfortable" ? "Confortable" : "Compact"}
              </button>
            ))}
          </div>
          {allowColumnToggle && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnsOpen((open) => !open)}
                aria-expanded={columnsOpen}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${FOCUS_RING}`}
                style={{
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  color: c.textSecondary,
                }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Colonnes
                <span className="text-xs" style={{ color: c.textMuted }}>
                  {activeColumns.length}
                </span>
              </button>
              {columnsOpen && (
                <>
                  <button
                    className="fixed inset-0 z-30 cursor-default"
                    aria-label="Fermer le menu des colonnes"
                    onClick={() => setColumnsOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full z-40 mt-2 w-60 rounded-lg border p-2 shadow-xl"
                    style={{ backgroundColor: c.surface, borderColor: c.border }}
                  >
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                        style={{ color: c.textSecondary }}
                      >
                        <input
                          type="checkbox"
                          checked={columnVisibility[column.key] !== false}
                          onChange={() =>
                            setColumnVisibility((current) => ({
                              ...current,
                              [column.key]: !current[column.key],
                            }))
                          }
                          className="h-3.5 w-3.5 accent-teal-400"
                        />
                        {column.label}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 px-5 py-12">
          {Array.from({ length: Math.min(itemsPerPage, 5) }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded"
              style={{ backgroundColor: c.surface }}
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-16 text-center">
          <Archive className="mb-3 h-8 w-8" style={{ color: c.textMuted }} />
          <p className="text-sm font-medium" style={{ color: c.textPrimary }}>
            {search ? `Aucun résultat pour « ${search} »` : emptyMessage}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className={`mt-2 text-xs ${FOCUS_RING}`}
              style={{ color: c.accent }}
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="table-scroll max-h-124 w-full min-w-0 max-w-full overflow-x-auto overflow-y-auto">
          <table className="w-max min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th
                  scope="col"
                  className={`sticky left-0 top-0 z-40 px-5 ${cellPadding} text-left`}
                  style={{
                    backgroundColor: c.card,
                    boxShadow: `1px 0 0 ${c.border}, 0 1px 0 ${c.border}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() =>
                      setSelected(allSelected ? new Set() : new Set(selectableIds))
                    }
                    aria-label="Sélectionner toutes les lignes"
                    className={`h-3.5 w-3.5 accent-teal-400 ${FOCUS_RING}`}
                  />
                </th>
                {activeColumns.map((column, index) => {
                  const active = sortKey === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={`sticky top-0 px-4 ${cellPadding} text-left text-xs font-semibold whitespace-nowrap ${index === 0 ? "left-13 z-50" : "z-20"}`}
                      style={{
                        backgroundColor: c.card,
                        color: c.textSecondary,
                        boxShadow:
                          index === 0
                            ? `1px 0 0 ${c.border}, 0 1px 0 ${c.border}`
                            : `0 1px 0 ${c.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        aria-label={`Trier par ${column.label}`}
                        className={`inline-flex items-center gap-1.5 rounded ${FOCUS_RING}`}
                      >
                        {column.label}
                        {active ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown
                            className="h-3.5 w-3.5"
                            style={{ color: c.textMuted }}
                          />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const isSelected = selected.has(item.id);
                const isHovered = hoveredRowId === item.id;
                const rowBackground = isSelected
                  ? isHovered
                    ? "rgba(45, 212, 191, 0.10)"
                    : "rgba(45, 212, 191, 0.06)"
                  : isHovered
                    ? c.rowHover
                    : c.card;
                return (
                  <tr
                    key={String(item.id)}
                    aria-selected={isSelected}
                    tabIndex={onView || onDelete ? 0 : undefined}
                    onClick={(event) => openRowMenu(event, item.id)}
                    onMouseEnter={() => setHoveredRowId(item.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openRowMenu(event, item.id);
                      }
                    }}
                    className={`group cursor-pointer border-t ${FOCUS_RING}`}
                    style={{ borderColor: c.borderSubtle }}
                  >
                    <td
                      className={`sticky left-0 z-30 px-5 ${cellPadding}`}
                      style={{
                        backgroundColor: rowBackground,
                        boxShadow: `1px 0 0 ${c.border}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                        aria-label={`Sélectionner ${String(item.id)}`}
                        className={`h-3.5 w-3.5 accent-teal-400 ${FOCUS_RING}`}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </td>
                    {activeColumns.map((column, index) => (
                      <td
                        key={column.key}
                        className={`px-4 ${cellPadding} whitespace-nowrap ${index === 0 ? "sticky left-13 z-40 px-5" : ""}`}
                        style={{
                          backgroundColor: rowBackground,
                          boxShadow: index === 0 ? `1px 0 0 ${c.border}` : undefined,
                        }}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activeRowId !== null && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-90 cursor-default"
                aria-label="Fermer le menu de la ligne"
                onClick={closeRowMenu}
              />
              <div
                role="menu"
                className="fixed z-100 min-w-48 overflow-hidden rounded-lg border p-1 shadow-xl"
                style={{
                  top: rowMenuPosition.top,
                  left: Math.max(8, rowMenuPosition.left),
                  backgroundColor: c.surface,
                  borderColor: c.border,
                }}
              >
                {onView && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onView(activeRowId);
                      closeRowMenu();
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${FOCUS_RING}`}
                    style={{
                      color: c.textSecondary,
                      transition: "background-color 150ms ease, color 150ms ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = c.accentSoft;
                      event.currentTarget.style.color = c.accent;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = "transparent";
                      event.currentTarget.style.color = c.textSecondary;
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Édition
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onDelete(activeRowId);
                      closeRowMenu();
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm ${FOCUS_RING}`}
                    style={{
                      color: "#F26D6D",
                      transition: "background-color 150ms ease, color 150ms ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = c.dangerSoft;
                      event.currentTarget.style.color = "#FF9A9A";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = "transparent";
                      event.currentTarget.style.color = "#F26D6D";
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Suppression
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div
        className="flex items-center justify-between gap-3 border-t px-5 py-4"
        style={{ borderColor: c.border }}
      >
        <span className="text-sm" style={{ color: c.textMuted }}>
          {sorted.length === 0 ? 0 : start + 1}–
          {Math.min(start + itemsPerPage, sorted.length)} sur {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
            aria-label="Page précédente"
            className={`rounded-md p-1.5 disabled:opacity-30 ${FOCUS_RING}`}
            style={{ color: c.textMuted }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            className="px-2 text-xs tabular-nums"
            style={{ color: c.textSecondary }}
          >
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
            aria-label="Page suivante"
            className={`rounded-md p-1.5 disabled:opacity-30 ${FOCUS_RING}`}
            style={{ color: c.textMuted }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
