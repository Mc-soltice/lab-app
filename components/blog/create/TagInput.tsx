// components/blog/create/TagInput.tsx
"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface TagInputProps {
  label: string;
  items: string[];
  placeholder: string;
  onAdd: (item: string) => Promise<void> | void;
  onRemove: (item: string) => void;
  availableItems?: string[];
  tagColor?: "gray" | "blue";
  disabled?: boolean;
  isCreating?: boolean;
  maxTags?: number;
  error?: string;
}

export default function TagInput({
  label,
  items,
  placeholder,
  onAdd,
  onRemove,
  availableItems = [],
  tagColor = "gray",
  disabled = false,
  isCreating = false,
  maxTags,
  error,
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMaxReached = maxTags ? items.length >= maxTags : false;
  const trimmedSearch = search.trim();

  // Filtrage
  const filteredItems = useMemo(
    () =>
      availableItems.filter(
        (item) =>
          !items.includes(item) &&
          item.toLowerCase().includes(trimmedSearch.toLowerCase())
      ),
    [availableItems, items, trimmedSearch]
  );

  const canCreate =
    !isMaxReached &&
    trimmedSearch.length > 0 &&
    !availableItems.some(
      (item) => item.toLowerCase() === trimmedSearch.toLowerCase()
    ) &&
    !items.some((item) => item.toLowerCase() === trimmedSearch.toLowerCase());

  const options = useMemo(
    () => [
      ...filteredItems.map((item) => ({
        type: "existing" as const,
        value: item,
      })),
      ...(canCreate ? [{ type: "create" as const, value: trimmedSearch }] : []),
    ],
    [filteredItems, canCreate, trimmedSearch]
  );

  // Reset active index
  useEffect(() => {
    setActiveIndex(0);
  }, [search, options.length]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ajout
  const handleAddItem = async (item: string) => {
    const value = item.trim();

    if (
      !value ||
      items.includes(value) ||
      isAdding ||
      disabled ||
      isMaxReached
    ) {
      return;
    }

    setIsAdding(true);
    try {
      await onAdd(value);
      setSearch("");
      setIsOpen(false);
      inputRef.current?.focus();
    } finally {
      setIsAdding(false);
    }
  };

  const handleSelectOption = async (item: string) => {
    const value = item.trim();
    if (!value || disabled || isMaxReached || isAdding) return;
    await handleAddItem(value);
  };

  // Clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isMaxReached) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setActiveIndex((prev) => (prev + 1) % Math.max(options.length, 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setActiveIndex(
        (prev) => (prev - 1 + options.length) % Math.max(options.length, 1)
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && options.length > 0) {
        handleAddItem(options[activeIndex].value);
      } else if (trimmedSearch) {
        handleAddItem(trimmedSearch);
      }
    }

    if (e.key === "Backspace" && !search && items.length > 0) {
      onRemove(items[items.length - 1]);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setSearch("");
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const getLimitMessage = () => {
    if (isMaxReached && maxTags !== undefined) {
      return `Limite de ${maxTags} tag${maxTags > 1 ? "s" : ""} atteinte`;
    }
    if (maxTags) {
      return `${items.length}/${maxTags} tags`;
    }
    return null;
  };

  // Styles
  const borderColor = isMaxReached
    ? "#EAB308"
    : error
    ? "#EF4444"
    : "var(--border)";

  const labelColor = isMaxReached
    ? "#EAB308"
    : error
    ? "#EF4444"
    : "var(--text-tertiary)";

  const tagStyles =
    tagColor === "blue"
      ? {
          bg: "var(--bg-tertiary)",
          text: "var(--accent)",
        }
      : {
          bg: "var(--bg-secondary)",
          text: "var(--text-secondary)",
        };

  return (
    <div className="space-y-1.5">
      <div ref={containerRef} className="relative">
        {/* Champ */}
        <div
          className="relative rounded-lg border transition-colors"
          style={{
            borderColor,
            background: "var(--bg-secondary)",
          }}
          onClick={() => {
            if (!disabled && !isMaxReached) {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
        >
          {/* Label flottant */}
          <label
            className="absolute left-3 px-0.5 transition-all duration-200 pointer-events-none"
            style={{
              color: labelColor,
              fontSize: items.length > 0 || search ? "11px" : "14px",
              top: items.length > 0 || search ? "6px" : "50%",
              transform: items.length > 0 || search ? "translateY(0)" : "translateY(-50%)",
            }}
          >
            {label}
            {maxTags && ` (${items.length}/${maxTags})`}
          </label>

          {/* Contenu */}
          <div
            className="flex flex-wrap items-center gap-1.5 px-3 pt-5 pb-1.5"
            style={{ minHeight: items.length > 0 ? "auto" : "52px" }}
          >
            {/* Tags */}
            {items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full"
                style={{
                  background: tagStyles.bg,
                  color: tagStyles.text,
                }}
              >
                <span className="max-w-[120px] truncate">{item}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item);
                  }}
                  className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Input */}
            {!isMaxReached && (
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[80px] bg-transparent outline-none text-sm py-1"
                style={{ color: "var(--text-primary)" }}
                placeholder={isOpen ? placeholder : ""}
                disabled={disabled}
              />
            )}

            {/* Loading */}
            {isCreating && (
              <div className="flex items-center gap-1 px-1">
                <Loader2
                  className="w-3 h-3 animate-spin"
                  style={{ color: "var(--accent)" }}
                />
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Création...
                </span>
              </div>
            )}

            {/* Max reached badge */}
            {isMaxReached && (
              <span className="text-xs text-yellow-500 font-medium">
                Max atteint
              </span>
            )}
          </div>
        </div>

        {/* Dropdown - s'ouvre par le HAUT */}
        {isOpen && !disabled && options.length > 0 && (
          <div
            className="absolute z-50 bottom-full left-0 right-0 mb-1 rounded-lg border shadow-lg max-h-48 overflow-y-auto"
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border)",
            }}
          >
            {options.map((option, index) => {
              const isActive = activeIndex === index;
              const isCreate = option.type === "create";

              return (
                <button
                  key={`${option.type}-${option.value}`}
                  type="button"
                  onClick={() => handleSelectOption(option.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${
                    isCreate ? "border-t" : ""
                  }`}
                  style={{
                    color: isCreate ? "var(--accent)" : "var(--text-primary)",
                    background: isActive ? "var(--bg-secondary)" : "transparent",
                    borderColor: "var(--border)",
                  }}
                >
                  {isCreate ? (
                    <>
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>Créer "{option.value}"</span>
                    </>
                  ) : (
                    <span>{option.value}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state - s'ouvre par le HAUT */}
        {isOpen &&
          !disabled &&
          trimmedSearch.length > 0 &&
          filteredItems.length === 0 &&
          !canCreate && (
            <div
              className="absolute z-50 bottom-full left-0 right-0 mb-1 rounded-lg border shadow-lg px-4 py-3 text-sm"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-tertiary)",
              }}
            >
              {isMaxReached
                ? "Limite de tags atteinte"
                : "Ce tag est déjà sélectionné"}
            </div>
          )}
      </div>

      {/* Messages */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {getLimitMessage() && !error && (
        <p
          className="text-xs"
          style={{
            color: isMaxReached ? "#EAB308" : "var(--text-tertiary)",
          }}
        >
          {getLimitMessage()}
        </p>
      )}
    </div>
  );
}