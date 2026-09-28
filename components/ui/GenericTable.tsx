"use client";

import {
  Archive,
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  Filter,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*                              Design tokens                                 */
/* -------------------------------------------------------------------------- */

const t = {
  // Surfaces
  card: "#FFFFFF",
  headerBg: "#FFFFFF",
  surface: "#FAFAFA",
  surfaceHover: "#F4F4F5",

  // Bordures (uniquement horizontales)
  borderH: "#F1F1F3", // séparateur de lignes, très subtil
  borderStrong: "#E4E4E7", // bordure carte
  borderInput: "#E4E4E7",

  // Texte
  text: "#18181B",
  textSecondary: "#52525B",
  textMuted: "#A1A1AA",
  textFaint: "#D4D4D8",

  // Accent
  accent: "#2563EB",
  accentSoft: "#EFF6FF",
  accentRing: "rgba(37, 99, 235, 0.12)",

  // États
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
  success: "#059669",

  // Divers
  shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)",
  shadowPop: "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
};

const IMAGE_SIZE_MAP = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" };
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type ColumnType =
  "text" | "image" | "badge" | "date" | "currency" | "number" | "percent" | "reference";

export type Aggregate = "sum" | "avg" | "min" | "max" | "count";

export interface ColumnConfig<T> {
  key: string;
  label: string;
  type?: ColumnType;
  render?: (item: T) => React.ReactNode;
  imageField?: string;
  imageAltField?: string;
  imageSize?: "sm" | "md" | "lg";
  badgeColors?: Record<string, string>;
  align?: "left" | "right" | "center";
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  aggregate?: Aggregate;
  currency?: string;
  hiddenByDefault?: boolean;
}

type TableDensity = "comfortable" | "compact" | "dense";
type SortDirection = "asc" | "desc" | null;

interface SortRule {
  key: string;
  direction: Exclude<SortDirection, null>;
}

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  titleField?: string;
  onDelete?: (id: string | number) => void;
  onView?: (id: string | number) => void;
  onDuplicate?: (id: string | number) => void;
  onBulkDelete?: (ids: Array<string | number>) => void;
  isLoading?: boolean;
  itemsPerPage?: number;
  emptyMessage?: string;
  defaultDensity?: TableDensity;
  allowColumnToggle?: boolean;
  showRowNumber?: boolean;
  showAggregates?: boolean;
  allowExport?: boolean;
  exportFileName?: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

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
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value: unknown, decimals = 2): string {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value ?? "");
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatCurrency(value: unknown, currency = "EUR"): string {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value ?? "");
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

function formatPercent(value: unknown, decimals = 1): string {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value ?? "");
  return `${n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`;
}

function defaultAlign<T>(column: ColumnConfig<T>): "left" | "right" | "center" {
  if (column.align) return column.align;
  if (["currency", "number", "percent"].includes(column.type ?? "")) return "right";
  return "left";
}

function computeAggregate<T>(
  rows: T[],
  column: ColumnConfig<T>,
  mode: Aggregate,
): string {
  if (mode === "count") return String(rows.length);
  const values = rows
    .map((r) => Number(getNestedValue(r, column.key)))
    .filter((n) => !Number.isNaN(n));
  if (values.length === 0) return "—";
  let result = 0;
  switch (mode) {
    case "sum":
      result = values.reduce((a, b) => a + b, 0);
      break;
    case "avg":
      result = values.reduce((a, b) => a + b, 0) / values.length;
      break;
    case "min":
      result = Math.min(...values);
      break;
    case "max":
      result = Math.max(...values);
      break;
  }
  if (column.type === "currency") return formatCurrency(result, column.currency);
  if (column.type === "percent") return formatPercent(result);
  return formatNumber(result, column.type === "number" ? 0 : 2);
}

function toCsv<T>(rows: T[], columns: ColumnConfig<T>[]): string {
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((col) => escape(col.label)).join(";");
  const body = rows
    .map((row) => columns.map((col) => escape(getNestedValue(row, col.key))).join(";"))
    .join("\n");
  return `${header}\n${body}`;
}

/* -------------------------------------------------------------------------- */
/*                                Composant                                   */
/* -------------------------------------------------------------------------- */

export function GenericTable<T extends { id: string | number }>({
  data,
  columns,
  titleField,
  onDelete,
  onView,
  onDuplicate,
  onBulkDelete,
  isLoading = false,
  itemsPerPage: initialItemsPerPage = 25,
  emptyMessage = "Aucune donnée",
  defaultDensity = "compact",
  allowColumnToggle = true,
  showRowNumber = true,
  showAggregates = false,
  allowExport = true,
  exportFileName = "export",
}: GenericTableProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [sortRules, setSortRules] = useState<SortRule[]>([]);
  const [selected, setSelected] = useState<Set<T["id"]>>(new Set());
  const [hoveredRowId, setHoveredRowId] = useState<T["id"] | null>(null);
  const [expandedMobileRowId, setExpandedMobileRowId] = useState<T["id"] | null>(null);
  const [activeRowId, setActiveRowId] = useState<T["id"] | null>(null);
  const [rowMenuPosition, setRowMenuPosition] = useState({ top: 0, left: 0 });
  const [goToPage, setGoToPage] = useState("");
  const lastClickedIndexRef = useRef<number | null>(null);

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        columns.map((col) => [col.key, col.hiddenByDefault ? false : true]),
      ),
  );

  useEffect(() => {
    setColumnVisibility((current) => {
      const next = { ...current };
      columns.forEach((col) => {
        if (!(col.key in next)) next[col.key] = col.hiddenByDefault ? false : true;
      });
      return next;
    });
  }, [columns]);

  const activeColumns = useMemo(() => {
    const visible = columns.filter((col) => columnVisibility[col.key] !== false);
    return visible.length > 0 ? visible : columns;
  }, [columns, columnVisibility]);

  const statusColumn = useMemo(
    () => columns.find((col) => ["status", "statut"].includes(col.key.toLowerCase())),
    [columns],
  );

  const statusOptions = useMemo(() => {
    if (!statusColumn) return [];
    return Array.from(
      new Set(
        data
          .map((item) => getNestedValue(item, statusColumn.key))
          .filter((v): v is string | number => v != null)
          .map(String),
      ),
    ).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
  }, [data, statusColumn]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((item) => {
      const matchSearch =
        query.length === 0 ||
        activeColumns.some((col) => {
          const v = getNestedValue(item, col.key);
          return v != null && String(v).toLowerCase().includes(query);
        });
      const matchStatus =
        !statusColumn ||
        selectedStatuses.size === 0 ||
        selectedStatuses.has(String(getNestedValue(item, statusColumn.key)));
      const matchColumnFilters = Object.entries(columnFilters).every(([key, val]) => {
        if (!val) return true;
        const v = getNestedValue(item, key);
        return v != null && String(v).toLowerCase().includes(val.toLowerCase());
      });
      return matchSearch && matchStatus && matchColumnFilters;
    });
  }, [activeColumns, data, search, selectedStatuses, statusColumn, columnFilters]);

  const sorted = useMemo(() => {
    if (sortRules.length === 0) return filtered;
    return [...filtered].sort((a, b) => {
      for (const rule of sortRules) {
        const av = getNestedValue(a, rule.key);
        const bv = getNestedValue(b, rule.key);
        const numA = Number(av);
        const numB = Number(bv);
        const bothNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);
        const cmp = bothNumeric
          ? numA - numB
          : String(av ?? "").localeCompare(String(bv ?? ""), "fr", {
              numeric: true,
              sensitivity: "base",
            });
        if (cmp !== 0) return rule.direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }, [filtered, sortRules]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const rows = sorted.slice(start, start + itemsPerPage);

  const selectableIds = data.map((item) => item.id);
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected;

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];
    if (search)
      chips.push({
        key: "search",
        label: `« ${search} »`,
        onClear: () => setSearch(""),
      });
    selectedStatuses.forEach((s) =>
      chips.push({
        key: `status-${s}`,
        label: `Statut : ${s}`,
        onClear: () =>
          setSelectedStatuses((curr) => {
            const n = new Set(curr);
            n.delete(s);
            return n;
          }),
      }),
    );
    Object.entries(columnFilters).forEach(([key, val]) => {
      if (!val) return;
      const col = columns.find((c) => c.key === key);
      chips.push({
        key: `filter-${key}`,
        label: `${col?.label ?? key} : ${val}`,
        onClear: () =>
          setColumnFilters((curr) => {
            const n = { ...curr };
            delete n[key];
            return n;
          }),
      });
    });
    return chips;
  }, [search, selectedStatuses, columnFilters, columns]);

  /* ------------------------------- Actions -------------------------------- */
  function toggleSort(key: string, shiftKey: boolean) {
    setSortRules((current) => {
      const existing = current.find((r) => r.key === key);
      if (!shiftKey) {
        if (!existing) return [{ key, direction: "asc" }];
        if (existing.direction === "asc") return [{ key, direction: "desc" }];
        return [];
      }
      if (!existing) return [...current, { key, direction: "asc" }];
      if (existing.direction === "asc")
        return current.map((r) => (r.key === key ? { ...r, direction: "desc" } : r));
      return current.filter((r) => r.key !== key);
    });
    setPage(1);
  }

  function toggleSelection(id: T["id"], index?: number, shiftKey?: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (
        shiftKey &&
        index != null &&
        lastClickedIndexRef.current != null &&
        lastClickedIndexRef.current !== index
      ) {
        const [from, to] = [lastClickedIndexRef.current, index].sort((a, b) => a - b);
        for (let i = from; i <= to; i++) next.add(rows[i].id);
      } else if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (index != null) lastClickedIndexRef.current = index;
  }

  function toggleStatus(status: string) {
    setSelectedStatuses((current) => {
      const next = new Set(current);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
    setPage(1);
  }

  function openRowMenu(event: React.SyntheticEvent<HTMLElement>, id: T["id"]) {
    if (!onView && !onDelete && !onDuplicate) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = Math.min(200, window.innerWidth - 24);
    const menuHeight = 160;
    const margin = 12;
    const left = Math.min(
      Math.max(margin, rect.left + 8),
      Math.max(margin, window.innerWidth - menuWidth - margin),
    );
    const top =
      rect.bottom + menuHeight > window.innerHeight - margin
        ? Math.max(margin, rect.top - menuHeight - 8)
        : rect.bottom + 8;
    setRowMenuPosition({ top, left });
    setActiveRowId(id);
  }

  function closeRowMenu() {
    setActiveRowId(null);
  }

  function exportCsv(onlySelected = false) {
    const source = onlySelected ? sorted.filter((r) => selected.has(r.id)) : sorted;
    const csv = toCsv(source, activeColumns);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportFileName}${onlySelected ? "-selection" : ""}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /* ------------------------------ Rendu cellule --------------------------- */
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
            className={`${IMAGE_SIZE_MAP[column.imageSize ?? "md"]} flex items-center justify-center rounded-md`}
            style={{ backgroundColor: t.surface, color: t.textMuted }}
          >
            <span className="text-[10px]">N/A</span>
          </div>
        );
      }
      return (
        <div
          className={`${IMAGE_SIZE_MAP[column.imageSize ?? "md"]} overflow-hidden rounded-md ring-1 ring-zinc-200/60`}
        >
          <Image
            src={String(src)}
            alt={alt}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    if (column.type === "badge" && column.badgeColors) {
      const colorClass =
        column.badgeColors[String(value)] ??
        "bg-zinc-100 text-zinc-600 ring-zinc-200/60";
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${colorClass}`}
        >
          {String(value ?? "")}
        </span>
      );
    }

    if (column.type === "date" && value)
      return (
        <span style={{ color: t.textSecondary }}>{formatDate(String(value))}</span>
      );
    if (column.type === "currency")
      return (
        <span style={{ color: t.text }} className="font-medium">
          {formatCurrency(value, column.currency)}
        </span>
      );
    if (column.type === "number") return <>{formatNumber(value, 0)}</>;
    if (column.type === "percent") return <>{formatPercent(value)}</>;
    if (column.type === "reference")
      return (
        <span
          className="font-mono text-[12px] tabular-nums"
          style={{ color: t.textSecondary }}
        >
          {String(value ?? "")}
        </span>
      );

    return <span style={{ color: t.textSecondary }}>{String(value ?? "")}</span>;
  }

  /* ------------------------------ Densité --------------------------------- */
  const cellPadding =
    density === "dense"
      ? "py-1 px-3 text-[12px]"
      : density === "compact"
        ? "py-2 px-3 text-[12.5px]"
        : "py-3 px-4 text-[13px]";
  const headerPadding =
    density === "dense"
      ? "py-1.5 px-3"
      : density === "compact"
        ? "py-2 px-3"
        : "py-3 px-4";

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="min-w-0 w-full max-w-full overflow-hidden rounded-xl bg-white"
      style={{
        border: `1px solid ${t.borderStrong}`,
        boxShadow: t.shadow,
      }}
    >
      {/* ------------------------------ Toolbar ------------------------------ */}
      <div className="flex min-w-0 max-w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        {/* Gauche : compteur + tri */}
        <div className="flex items-center gap-3">
          <span
            className="text-[12.5px] font-semibold tabular-nums"
            style={{ color: t.text }}
          >
            {sorted.length.toLocaleString("fr-FR")}
          </span>
          <span className="text-[12.5px]" style={{ color: t.textMuted }}>
            enregistrement{sorted.length > 1 ? "s" : ""}
          </span>
          {sortRules.length > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: t.accentSoft, color: t.accent }}
            >
              <ArrowDownUp className="h-3 w-3" />
              {sortRules
                .map((r) => {
                  const col = columns.find((c) => c.key === r.key);
                  return `${col?.label ?? r.key} ${r.direction === "asc" ? "↑" : "↓"}`;
                })
                .join(" · ")}
              <button
                type="button"
                onClick={() => setSortRules([])}
                className={`rounded-full p-0.5 hover:bg-blue-100 ${FOCUS}`}
                aria-label="Effacer le tri"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}
        </div>

        {/* Droite : recherche + filtres */}
        <div className="flex min-w-0 w-full flex-1 items-center gap-2 sm:justify-end">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: t.textMuted }}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher…"
              aria-label="Rechercher"
              className={`w-full rounded-lg border bg-white py-1.5 pl-8 pr-2 text-[13px] transition-colors ${FOCUS}`}
              style={{ borderColor: t.borderInput, color: t.text }}
            />
          </div>

          {statusColumn && statusOptions.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((o) => !o)}
                aria-expanded={statusOpen}
                className={`inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-zinc-50 ${FOCUS}`}
                style={{
                  borderColor: selectedStatuses.size > 0 ? t.accent : t.borderInput,
                  color: selectedStatuses.size > 0 ? t.accent : t.textSecondary,
                }}
              >
                Statut
                {selectedStatuses.size > 0 && (
                  <span
                    className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                    style={{ backgroundColor: t.accent, color: "white" }}
                  >
                    {selectedStatuses.size}
                  </span>
                )}
                <ChevronDown className="h-3 w-3" style={{ color: t.textMuted }} />
              </button>
              {statusOpen && (
                <>
                  <button
                    className="fixed inset-0 z-30 cursor-default"
                    aria-label="Fermer"
                    onClick={() => setStatusOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full z-40 mt-1.5 min-w-44 rounded-lg border bg-white p-1"
                    style={{ borderColor: t.borderStrong, boxShadow: t.shadowPop }}
                  >
                    {statusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] hover:bg-zinc-50"
                        style={{ color: t.textSecondary }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.has(status)}
                          onChange={() => toggleStatus(status)}
                          className="h-3.5 w-3.5 accent-blue-600"
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Densité */}
          <div
            className="hidden md:inline-flex rounded-lg border bg-zinc-50/50 p-0.5"
            style={{ borderColor: t.borderInput }}
          >
            {(["comfortable", "compact", "dense"] as TableDensity[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDensity(option)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${FOCUS}`}
                style={
                  density === option
                    ? { backgroundColor: "white", color: t.text, boxShadow: t.shadow }
                    : { color: t.textMuted }
                }
                title={
                  option === "comfortable"
                    ? "Confortable"
                    : option === "compact"
                      ? "Compact"
                      : "Dense"
                }
              >
                {option === "comfortable" ? "L" : option === "compact" ? "M" : "S"}
              </button>
            ))}
          </div>

          {allowExport && (
            <button
              type="button"
              onClick={() => exportCsv(false)}
              className={`inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-zinc-50 ${FOCUS}`}
              style={{ borderColor: t.borderInput, color: t.textSecondary }}
              title="Exporter en CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {allowColumnToggle && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnsOpen((o) => !o)}
                aria-expanded={columnsOpen}
                className={`inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-zinc-50 ${FOCUS}`}
                style={{ borderColor: t.borderInput, color: t.textSecondary }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Colonnes</span>
                <span className="text-[10px]" style={{ color: t.textMuted }}>
                  {activeColumns.length}
                </span>
              </button>
              {columnsOpen && (
                <>
                  <button
                    className="fixed inset-0 z-30 cursor-default"
                    aria-label="Fermer"
                    onClick={() => setColumnsOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full z-40 mt-1.5 w-56 rounded-lg border bg-white p-1"
                    style={{ borderColor: t.borderStrong, boxShadow: t.shadowPop }}
                  >
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] hover:bg-zinc-50"
                        style={{ color: t.textSecondary }}
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
                          className="h-3.5 w-3.5 accent-blue-600"
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

      {/* --------------------------- Chips de filtres ------------------------ */}
      {activeFilterChips.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-1.5 border-t px-4 py-2"
          style={{ borderColor: t.borderH }}
        >
          {activeFilterChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full border bg-zinc-50 px-2 py-0.5 text-[11px] font-medium"
              style={{ borderColor: t.borderInput, color: t.textSecondary }}
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onClear}
                className={`rounded-full p-0.5 hover:bg-zinc-200 ${FOCUS}`}
                aria-label={`Retirer ${chip.label}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedStatuses(new Set());
              setColumnFilters({});
            }}
            className={`ml-1 text-[11px] font-medium underline-offset-2 hover:underline ${FOCUS}`}
            style={{ color: t.accent }}
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* ------------------------- Barre d'actions groupées ----------------- */}
      {selected.size > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 border-t px-4 py-2"
          style={{
            borderColor: t.borderH,
            backgroundColor: t.accentSoft,
          }}
        >
          <span className="text-[12.5px] font-semibold" style={{ color: t.accent }}>
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {allowExport && (
              <button
                type="button"
                onClick={() => exportCsv(true)}
                className={`inline-flex items-center gap-1 rounded-md border bg-white px-2.5 py-1 text-[12px] font-medium hover:bg-zinc-50 ${FOCUS}`}
                style={{ borderColor: t.borderInput, color: t.textSecondary }}
              >
                <Download className="h-3 w-3" />
                Exporter
              </button>
            )}
            {onBulkDelete && (
              <button
                type="button"
                onClick={() => {
                  onBulkDelete(Array.from(selected));
                  setSelected(new Set());
                }}
                className={`inline-flex items-center gap-1 rounded-md border bg-white px-2.5 py-1 text-[12px] font-medium hover:bg-red-50 ${FOCUS}`}
                style={{ borderColor: t.borderInput, color: t.danger }}
              >
                <Trash2 className="h-3 w-3" />
                Supprimer
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className={`rounded-md px-2 py-1 text-[12px] font-medium hover:bg-white/60 ${FOCUS}`}
              style={{ color: t.textSecondary }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------ Contenu ----------------------------- */}
      {isLoading ? (
        <div className="space-y-2 px-4 py-6">
          {Array.from({ length: Math.min(itemsPerPage, 6) }).map((_, i) => (
            <div
              key={i}
              className="h-7 animate-pulse rounded-md"
              style={{ backgroundColor: t.surface }}
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-16 text-center">
          <div
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: t.surface }}
          >
            <Archive className="h-5 w-5" style={{ color: t.textMuted }} />
          </div>
          <p className="text-[13px] font-medium" style={{ color: t.text }}>
            {search ? `Aucun résultat pour « ${search} »` : emptyMessage}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className={`mt-2 text-[12px] font-medium ${FOCUS}`}
              style={{ color: t.accent }}
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ---------------------------- Desktop --------------------------- */}
          <div className="hidden md:block">
            <div className="max-h-144 w-full min-w-0 max-w-full overflow-x-auto overflow-y-auto">
              <table className="w-max min-w-full border-collapse text-[12.5px]">
                <thead>
                  <tr>
                    {/* # row number */}
                    {showRowNumber && (
                      <th
                        scope="col"
                        className={`sticky left-0 top-0 z-40 w-10 ${headerPadding} text-right text-[10px] font-medium uppercase tracking-wider`}
                        style={{
                          backgroundColor: t.headerBg,
                          color: t.textFaint,
                          borderBottom: `1px solid ${t.borderH}`,
                        }}
                      >
                        #
                      </th>
                    )}
                    {/* checkbox */}
                    <th
                      scope="col"
                      className={`sticky ${showRowNumber ? "left-10" : "left-0"} top-0 z-40 w-9 ${headerPadding} text-center`}
                      style={{
                        backgroundColor: t.headerBg,
                        borderBottom: `1px solid ${t.borderH}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={() =>
                          setSelected(allSelected ? new Set() : new Set(selectableIds))
                        }
                        aria-label="Sélectionner tout"
                        className={`h-3.5 w-3.5 accent-blue-600 ${FOCUS}`}
                      />
                    </th>

                    {activeColumns.map((column, index) => {
                      const rule = sortRules.find((r) => r.key === column.key);
                      const sortIndex = sortRules.findIndex(
                        (r) => r.key === column.key,
                      );
                      const align = defaultAlign(column);
                      const filterValue = columnFilters[column.key] ?? "";
                      const stickyLeft = showRowNumber
                        ? index === 0
                          ? "left-19 z-50"
                          : ""
                        : index === 0
                          ? "left-9 z-50"
                          : "";
                      return (
                        <th
                          key={column.key}
                          scope="col"
                          className={`sticky top-0 ${headerPadding} text-[10.5px] font-semibold uppercase tracking-wider whitespace-nowrap ${stickyLeft} z-20`}
                          style={{
                            backgroundColor: t.headerBg,
                            color: t.textMuted,
                            textAlign: align,
                            width: column.width,
                            borderBottom: `1px solid ${t.borderH}`,
                          }}
                        >
                          <div
                            className={`inline-flex items-center gap-1 ${
                              align === "right"
                                ? "justify-end w-full"
                                : align === "center"
                                  ? "justify-center w-full"
                                  : ""
                            }`}
                          >
                            {column.sortable !== false ? (
                              <button
                                type="button"
                                onClick={(e) => toggleSort(column.key, e.shiftKey)}
                                aria-label={`Trier par ${column.label}`}
                                className={`inline-flex items-center gap-1 rounded transition-colors hover:text-zinc-700 ${FOCUS}`}
                                style={{
                                  color: rule ? t.accent : undefined,
                                }}
                              >
                                {column.label}
                                {rule ? (
                                  <span className="inline-flex items-center gap-0.5">
                                    {rule.direction === "asc" ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )}
                                    {sortRules.length > 1 && (
                                      <span
                                        className="text-[9px] font-bold"
                                        style={{ color: t.accent }}
                                      >
                                        {sortIndex + 1}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <ChevronsUpDown
                                    className="h-3 w-3 opacity-0 transition-opacity group-hover/th:opacity-100"
                                    style={{ color: t.textFaint }}
                                  />
                                )}
                              </button>
                            ) : (
                              <span>{column.label}</span>
                            )}

                            {column.filterable && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenFilterKey((k) =>
                                      k === column.key ? null : column.key,
                                    )
                                  }
                                  className={`rounded p-0.5 transition-colors hover:bg-zinc-100 ${FOCUS}`}
                                  aria-label={`Filtrer ${column.label}`}
                                >
                                  <Filter
                                    className="h-3 w-3"
                                    style={{
                                      color: filterValue ? t.accent : t.textFaint,
                                      fill: filterValue ? t.accent : "none",
                                    }}
                                  />
                                </button>
                                {openFilterKey === column.key && (
                                  <>
                                    <button
                                      className="fixed inset-0 z-30 cursor-default"
                                      aria-label="Fermer"
                                      onClick={() => setOpenFilterKey(null)}
                                    />
                                    <div
                                      className="absolute right-0 top-full z-40 mt-1.5 w-56 rounded-lg border bg-white p-2 normal-case tracking-normal"
                                      style={{
                                        borderColor: t.borderStrong,
                                        boxShadow: t.shadowPop,
                                      }}
                                    >
                                      <input
                                        autoFocus
                                        type="text"
                                        value={filterValue}
                                        onChange={(e) =>
                                          setColumnFilters((curr) => ({
                                            ...curr,
                                            [column.key]: e.target.value,
                                          }))
                                        }
                                        placeholder={`Filtrer…`}
                                        className={`w-full rounded-md border px-2 py-1 text-[12px] font-normal ${FOCUS}`}
                                        style={{
                                          borderColor: t.borderInput,
                                          color: t.text,
                                        }}
                                      />
                                      <div className="mt-2 flex items-center justify-between">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setColumnFilters((curr) => {
                                              const n = { ...curr };
                                              delete n[column.key];
                                              return n;
                                            })
                                          }
                                          className={`text-[11px] font-medium ${FOCUS}`}
                                          style={{ color: t.textMuted }}
                                        >
                                          Effacer
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setOpenFilterKey(null)}
                                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${FOCUS}`}
                                          style={{
                                            backgroundColor: t.accent,
                                            color: "white",
                                          }}
                                        >
                                          OK
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </th>
                      );
                    })}

                    {(onView || onDelete || onDuplicate) && (
                      <th
                        scope="col"
                        aria-label="Actions"
                        className={`sticky right-0 top-0 z-40 w-28 ${headerPadding} text-right text-[10.5px] font-semibold uppercase tracking-wider`}
                        style={{
                          backgroundColor: t.headerBg,
                          color: t.textFaint,
                          borderBottom: `1px solid ${t.borderH}`,
                        }}
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, rowIndex) => {
                    const isSelected = selected.has(item.id);
                    const isHovered = hoveredRowId === item.id;
                    const rowBackground = isSelected
                      ? t.accentSoft
                      : isHovered
                        ? t.surface
                        : t.card;
                    const globalIndex = start + rowIndex + 1;

                    return (
                      <tr
                        key={String(item.id)}
                        aria-selected={isSelected}
                        tabIndex={onView || onDelete ? 0 : undefined}
                        onClick={(e) => openRowMenu(e, item.id)}
                        onDoubleClick={() => onView?.(item.id)}
                        onMouseEnter={() => setHoveredRowId(item.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openRowMenu(e, item.id);
                          }
                        }}
                        className={`group cursor-pointer transition-colors ${FOCUS}`}
                        style={{ borderBottom: `1px solid ${t.borderH}` }}
                      >
                        {/* Accent barre sélection */}
                        <td
                          className="sticky left-0 z-30 p-0"
                          style={{ backgroundColor: rowBackground }}
                        >
                          <div className="flex items-center justify-end">
                            <div
                              className="h-full w-0.75 transition-colors"
                              style={{
                                backgroundColor: isSelected ? t.accent : "transparent",
                              }}
                            />
                            {showRowNumber && (
                              <span
                                className={`flex-1 ${cellPadding} text-right tabular-nums`}
                                style={{ color: t.textFaint }}
                              >
                                {globalIndex}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className={`sticky ${showRowNumber ? "left-10" : "left-0"} z-30 ${cellPadding} text-center`}
                          style={{ backgroundColor: rowBackground }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                              e.stopPropagation();
                              toggleSelection(item.id, rowIndex, e.shiftKey);
                            }}
                            aria-label={`Sélectionner ${String(item.id)}`}
                            className={`h-3.5 w-3.5 accent-blue-600 ${FOCUS}`}
                          />
                        </td>
                        {activeColumns.map((column, index) => {
                          const align = defaultAlign(column);
                          const isFirst = index === 0;
                          const stickyLeft = showRowNumber
                            ? isFirst
                              ? "sticky left-19 z-20"
                              : ""
                            : isFirst
                              ? "sticky left-9 z-20"
                              : "";
                          return (
                            <td
                              key={column.key}
                              className={`${cellPadding} whitespace-nowrap ${stickyLeft}`}
                              style={{
                                backgroundColor: rowBackground,
                                color: t.textSecondary,
                                textAlign: align,
                                fontVariantNumeric: [
                                  "number",
                                  "currency",
                                  "percent",
                                  "reference",
                                ].includes(column.type ?? "")
                                  ? "tabular-nums"
                                  : undefined,
                              }}
                            >
                              {renderCell(item, column)}
                            </td>
                          );
                        })}

                        {(onView || onDelete || onDuplicate) && (
                          <td
                            className={`sticky right-0 z-30 ${cellPadding} text-right`}
                            style={{ backgroundColor: rowBackground }}
                          >
                            <div
                              className="flex items-center justify-end gap-0.5 transition-opacity"
                              style={{
                                opacity: isHovered || activeRowId === item.id ? 1 : 0,
                              }}
                            >
                              {onView && (
                                <button
                                  type="button"
                                  title="Voir / Modifier"
                                  aria-label="Voir / Modifier"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onView(item.id);
                                  }}
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white hover:shadow-sm ${FOCUS}`}
                                  style={{ color: t.textSecondary }}
                                >
                                  <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                                </button>
                              )}
                              {onDuplicate && (
                                <button
                                  type="button"
                                  title="Dupliquer"
                                  aria-label="Dupliquer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate(item.id);
                                  }}
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white hover:shadow-sm ${FOCUS}`}
                                  style={{ color: t.textSecondary }}
                                >
                                  <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  type="button"
                                  title="Supprimer"
                                  aria-label="Supprimer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                  }}
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white hover:shadow-sm ${FOCUS}`}
                                  style={{ color: t.danger }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>

                {/* ------------------------- Footer agrégats ------------------ */}
                {showAggregates && activeColumns.some((col) => col.aggregate) && (
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${t.borderStrong}` }}>
                      <td
                        className="sticky left-0 z-30 p-0"
                        style={{ backgroundColor: t.headerBg }}
                      >
                        <div className="h-full w-0.75 bg-transparent" />
                      </td>
                      <td
                        className={`sticky ${showRowNumber ? "left-10" : "left-0"} z-30 px-2 py-2.5`}
                        style={{ backgroundColor: t.headerBg }}
                      />
                      {activeColumns.map((column, index) => {
                        const align = defaultAlign(column);
                        const isFirst = index === 0;
                        const stickyLeft = showRowNumber
                          ? isFirst
                            ? "sticky left-19 z-20"
                            : ""
                          : isFirst
                            ? "sticky left-9 z-20"
                            : "";
                        return (
                          <td
                            key={column.key}
                            className={`px-3 py-2.5 text-[11.5px] font-semibold whitespace-nowrap ${stickyLeft}`}
                            style={{
                              backgroundColor: t.headerBg,
                              color: t.text,
                              textAlign: align,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {column.aggregate
                              ? computeAggregate(sorted, column, column.aggregate)
                              : ""}
                          </td>
                        );
                      })}
                      {(onView || onDelete || onDuplicate) && (
                        <td
                          className="sticky right-0 z-30"
                          style={{ backgroundColor: t.headerBg }}
                        />
                      )}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ----------------------------- Mobile ---------------------------- */}
          <div className="space-y-2.5 px-3 py-3 md:hidden">
            {rows.map((item, rowIndex) => {
              const isSelected = selected.has(item.id);
              const isExpanded = expandedMobileRowId === item.id;
              const globalIndex = start + rowIndex + 1;
              const primaryValue =
                titleField && getNestedValue(item, titleField) != null
                  ? String(getNestedValue(item, titleField))
                  : activeColumns[0]
                    ? String(getNestedValue(item, activeColumns[0].key) ?? "")
                    : "";

              // Champs secondaires affichés dans le dropdown
              const mobileFields = activeColumns.filter((col) => {
                if (titleField) return col.key !== titleField;
                return col.key !== activeColumns[0]?.key;
              });

              // Récupère une image principale éventuelle (1ère colonne image)
              const imageColumn = activeColumns.find((col) => col.type === "image");
              const imageSrc = imageColumn
                ? getNestedValue(item, imageColumn.imageField ?? imageColumn.key)
                : null;
              const imageAlt = imageColumn?.imageAltField
                ? String(getNestedValue(item, imageColumn.imageAltField) ?? "")
                : primaryValue;

              // Initiale pour fallback avatar
              const initial = (primaryValue || "?").trim().charAt(0).toUpperCase();

              // Statut éventuel
              const statusValue = statusColumn
                ? getNestedValue(item, statusColumn.key)
                : null;
              const statusColorClass = statusColumn?.badgeColors?.[String(statusValue)];

              return (
                <div
                  key={String(item.id)}
                  className="group/card relative overflow-hidden rounded-xl bg-white transition-all duration-200"
                  style={{
                    border: `1px solid ${isSelected ? t.accent : t.borderH}`,
                    boxShadow: isSelected
                      ? `0 0 0 3px ${t.accentRing}, 0 1px 2px rgba(0,0,0,0.04)`
                      : isExpanded
                        ? "0 4px 12px -2px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.03)"
                        : "0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Barre accent verticale quand sélectionné */}
                  {isSelected && (
                    <div
                      className="absolute inset-y-0 left-0 w-0.75"
                      style={{ backgroundColor: t.accent }}
                    />
                  )}

                  {/* ------------------------------ Header carte ---------------------- */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedMobileRowId(isExpanded ? null : item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedMobileRowId(isExpanded ? null : item.id);
                      }
                    }}
                    className={`flex cursor-pointer items-center gap-3 p-3.5 ${FOCUS}`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Sélectionner ${String(item.id)}`}
                      className="h-4 w-4 shrink-0 rounded accent-blue-600"
                    />

                    {/* Avatar / initiale */}
                    {imageSrc ? (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-200/70">
                        <Image
                          src={String(imageSrc)}
                          alt={imageAlt}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[13px] font-semibold ring-1 ring-inset"
                        style={
                          {
                            backgroundColor: t.surface,
                            color: t.textSecondary,
                            "--tw-ring-color": t.borderH,
                          } as React.CSSProperties
                        }
                      >
                        {initial}
                      </div>
                    )}

                    {/* Titre + méta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className="truncate text-[13.5px] font-semibold leading-tight"
                          style={{ color: t.text }}
                        >
                          {primaryValue || "—"}
                        </p>
                        <span
                          className="shrink-0 text-[10.5px] font-medium tabular-nums"
                          style={{ color: t.textFaint }}
                        >
                          #{globalIndex}
                        </span>
                      </div>

                      {/* Sous-ligne : statut + 1er champ secondaire */}
                      <div className="mt-1 flex items-center gap-2">
                        {statusValue != null && (
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.75 text-[10.5px] font-medium ring-1 ring-inset ${statusColorClass ?? "bg-zinc-100 text-zinc-600 ring-zinc-200/70"}`}
                          >
                            {String(statusValue)}
                          </span>
                        )}
                        {mobileFields[0] && (
                          <span
                            className="truncate text-[11.5px]"
                            style={{ color: t.textMuted }}
                          >
                            {mobileFields[0].label}:{" "}
                            <span style={{ color: t.textSecondary }}>
                              {String(getNestedValue(item, mobileFields[0].key) ?? "—")}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron dans un rond */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                      style={{
                        backgroundColor: isExpanded ? t.accentSoft : t.surface,
                        color: isExpanded ? t.accent : t.textSecondary,
                      }}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        strokeWidth={2}
                      />
                    </div>
                  </div>

                  {/* ------------------------------ Dropdown détaillé ---------------- */}
                  {isExpanded && (
                    <div
                      className="mobile-dropdown border-t"
                      style={{
                        borderColor: t.borderH,
                        backgroundColor: "#FCFCFD",
                      }}
                    >
                      {/* Section titre */}
                      <div className="px-3.5 pt-3 pb-1.5">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                          style={{ color: t.textFaint }}
                        >
                          Détails
                        </span>
                      </div>

                      {/* Lignes de détail */}
                      <div className="px-3.5">
                        {mobileFields.length > 0 ? (
                          <div
                            className="overflow-hidden rounded-lg border bg-white"
                            style={{ borderColor: t.borderH }}
                          >
                            {mobileFields.map((column, idx) => {
                              const isLast = idx === mobileFields.length - 1;
                              const value = getNestedValue(item, column.key);
                              return (
                                <div
                                  key={column.key}
                                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                                  style={{
                                    borderBottom: isLast
                                      ? undefined
                                      : `1px solid ${t.borderH}`,
                                  }}
                                >
                                  <span
                                    className="shrink-0 text-[11.5px] font-medium"
                                    style={{ color: t.textMuted }}
                                  >
                                    {column.label}
                                  </span>
                                  <span
                                    className="min-w-0 truncate text-right text-[12.5px]"
                                    style={{
                                      color: t.text,
                                      fontVariantNumeric: [
                                        "number",
                                        "currency",
                                        "percent",
                                        "reference",
                                      ].includes(column.type ?? "")
                                        ? "tabular-nums"
                                        : undefined,
                                    }}
                                  >
                                    {renderCell(item, column) ?? (
                                      <span style={{ color: t.textFaint }}>—</span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p
                            className="rounded-lg border bg-white px-3 py-3 text-center text-[12px]"
                            style={{ borderColor: t.borderH, color: t.textMuted }}
                          >
                            Aucun autre champ à afficher.
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {(onView || onDelete || onDuplicate) && (
                        <div className="px-3.5 pt-3 pb-3.5">
                          <div
                            className="flex flex-col gap-1.5 border-t pt-3"
                            style={{ borderColor: t.borderH }}
                          >
                            {onView && (
                              <button
                                type="button"
                                onClick={() => onView(item.id)}
                                className={`flex w-full items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 text-[12.5px] font-medium transition-colors hover:bg-zinc-50 active:bg-zinc-100 ${FOCUS}`}
                                style={{
                                  borderColor: t.borderInput,
                                  color: t.text,
                                }}
                              >
                                <Eye
                                  className="h-4 w-4 shrink-0"
                                  strokeWidth={1.75}
                                  style={{ color: t.textSecondary }}
                                />
                                Voir / Modifier
                              </button>
                            )}
                            {onDuplicate && (
                              <button
                                type="button"
                                onClick={() => onDuplicate(item.id)}
                                className={`flex w-full items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 text-[12.5px] font-medium transition-colors hover:bg-zinc-50 active:bg-zinc-100 ${FOCUS}`}
                                style={{
                                  borderColor: t.borderInput,
                                  color: t.text,
                                }}
                              >
                                <Copy
                                  className="h-4 w-4 shrink-0"
                                  strokeWidth={1.75}
                                  style={{ color: t.textSecondary }}
                                />
                                Dupliquer
                              </button>
                            )}
                            {onDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(item.id)}
                                className={`flex w-full items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 text-[12.5px] font-medium transition-colors hover:bg-red-50 active:bg-red-100 ${FOCUS}`}
                                style={{
                                  borderColor: t.borderInput,
                                  color: t.danger,
                                }}
                              >
                                <Trash2
                                  className="h-4 w-4 shrink-0"
                                  strokeWidth={1.75}
                                />
                                Supprimer
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ------------------------- Menu contextuel ----------------------- */}
          {activeRowId !== null && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-90 cursor-default"
                aria-label="Fermer le menu"
                onClick={closeRowMenu}
              />
              <div
                role="menu"
                className="fixed z-100 min-w-44 overflow-hidden rounded-lg border bg-white p-1"
                style={{
                  top: rowMenuPosition.top,
                  left: Math.max(8, rowMenuPosition.left),
                  borderColor: t.borderStrong,
                  boxShadow: t.shadowPop,
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
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors hover:bg-zinc-50 ${FOCUS}`}
                    style={{ color: t.textSecondary }}
                  >
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Ouvrir la fiche
                  </button>
                )}
                {onDuplicate && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onDuplicate(activeRowId);
                      closeRowMenu();
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors hover:bg-zinc-50 ${FOCUS}`}
                    style={{ color: t.textSecondary }}
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Dupliquer
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
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors hover:bg-red-50 ${FOCUS}`}
                    style={{ color: t.danger }}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Supprimer
                  </button>
                )}
              </div>
            </>
          )}

          {/* ------------------------------ Footer --------------------------- */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5"
            style={{ borderColor: t.borderH }}
          >
            <div
              className="flex items-center gap-3 text-[12px]"
              style={{ color: t.textMuted }}
            >
              <span className="tabular-nums">
                {sorted.length === 0 ? 0 : start + 1}–
                {Math.min(start + itemsPerPage, sorted.length)}{" "}
                <span style={{ color: t.textFaint }}>sur</span>{" "}
                {sorted.length.toLocaleString("fr-FR")}
              </span>
              <label className="inline-flex items-center gap-1.5">
                <span className="hidden sm:inline">Lignes</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className={`rounded-md border bg-white px-1.5 py-0.5 text-[12px] transition-colors hover:bg-zinc-50 ${FOCUS}`}
                  style={{ borderColor: t.borderInput, color: t.textSecondary }}
                >
                  {[10, 25, 50, 100, 250, 500].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                aria-label="Première page"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent ${FOCUS}`}
                style={{ color: t.textSecondary }}
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Page précédente"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent ${FOCUS}`}
                style={{ color: t.textSecondary }}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <div
                className="flex items-center gap-1 px-2 text-[12px]"
                style={{ color: t.textSecondary }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={goToPage || String(safePage)}
                  onChange={(e) => setGoToPage(e.target.value.replace(/\D/g, ""))}
                  onBlur={() => {
                    const n = Number(goToPage);
                    if (!Number.isNaN(n) && n >= 1 && n <= totalPages) setPage(n);
                    setGoToPage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const n = Number(goToPage);
                      if (!Number.isNaN(n) && n >= 1 && n <= totalPages) setPage(n);
                      setGoToPage("");
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className={`w-9 rounded-md border bg-white px-1 py-0.5 text-center text-[12px] tabular-nums transition-colors hover:bg-zinc-50 ${FOCUS}`}
                  style={{ borderColor: t.borderInput, color: t.text }}
                  aria-label="Aller à la page"
                />
                <span style={{ color: t.textFaint }}>/</span>
                <span className="tabular-nums">{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Page suivante"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent ${FOCUS}`}
                style={{ color: t.textSecondary }}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                aria-label="Dernière page"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent ${FOCUS}`}
                style={{ color: t.textSecondary }}
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
