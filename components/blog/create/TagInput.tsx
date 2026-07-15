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
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = items.length > 0 || search.length > 0;
  const isMaxReached = maxTags ? items.length >= maxTags : false;

  // Liste filtrée selon la recherche, en excluant ce qui est déjà sélectionné
  const filteredItems = useMemo(
    () =>
      availableItems.filter(
        (item) =>
          !items.includes(item) &&
          item.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [availableItems, items, search],
  );

  // On ne propose "Créer" que si la recherche n'est pas vide et ne matche
  // pas déjà exactement un élément existant (insensible à la casse)
  const trimmedSearch = search.trim();
  const canCreate =
    !isMaxReached &&
    trimmedSearch.length > 0 &&
    !availableItems.some(
      (item) => item.toLowerCase() === trimmedSearch.toLowerCase(),
    ) &&
    !items.some((item) => item.toLowerCase() === trimmedSearch.toLowerCase());

  // Liste combinée affichée dans le dropdown : résultats filtrés + option "créer"
  const options = useMemo(
    () => [
      ...filteredItems.map((item) => ({
        type: "existing" as const,
        value: item,
      })),
      ...(canCreate ? [{ type: "create" as const, value: trimmedSearch }] : []),
    ],
    [filteredItems, canCreate, trimmedSearch],
  );

  // Réinitialiser l'index actif quand la liste change
  useEffect(() => {
    setActiveIndex(0);
  }, [search, isOpen, options.length]);

  // Gestion du clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gestion de l'ajout d'un item
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
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSelectOption = async (item: string) => {
    const value = item.trim();
    if (!value || disabled || isMaxReached || isAdding) return;

    if (
      availableItems.some(
        (option) => option.toLowerCase() === value.toLowerCase(),
      )
    ) {
      await onAdd(value);
      setSearch("");
      setIsOpen(false);
      inputRef.current?.focus();
      return;
    }

    await handleAddItem(value);
  };

  // Gestion des touches du clavier
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
        (prev) => (prev - 1 + options.length) % Math.max(options.length, 1),
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
      // Supprime le dernier tag si l'input est vide
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
    setIsFocused(true);
    setIsOpen(true);
  };

  // Message pour la limite de tags
  const getLimitMessage = () => {
    if (isMaxReached && maxTags !== undefined) {
      return `Limite de ${maxTags} tag${maxTags > 1 ? "s" : ""} atteinte`;
    }
    if (maxTags) {
      return `${items.length}/${maxTags} tags`;
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="relative">
        <fieldset
          className={`relative rounded-xl border px-3 transition-all flex flex-col ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          } ${isMaxReached ? "border-yellow-500" : ""}`}
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: isMaxReached
              ? "#EAB308"
              : isFocused
                ? "var(--accent)"
                : "var(--border)",
            height: "65px",
          }}
          onClick={() => {
            if (!disabled && !isMaxReached) {
              setIsFocused(true);
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
        >
          <legend
            className="px-2 leading-none overflow-hidden shrink-0"
            style={{ height: "12px" }}
          >
            <span
              className="block text-[12px] transition-opacity duration-200"
              style={{
                color: isMaxReached
                  ? "#EAB308"
                  : isFocused
                    ? "var(--accent)"
                    : "var(--text-tertiary)",
                opacity: isFocused || hasValue ? 1 : 0,
              }}
            >
              {label} {maxTags && `(${items.length}/${maxTags})`}
            </span>
          </legend>

          <div className="flex flex-wrap items-center gap-2 py-1 flex-1 overflow-y-auto min-h-0">
            {/* Placeholder centré dans le champ */}
            {!isFocused && !hasValue && (
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm transition-all"
                style={{
                  color: "var(--text-tertiary)",
                }}
              >
                {label}
              </span>
            )}

            {/* TAGS */}
            {items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full animate-in fade-in-0 zoom-in-50 duration-200"
                style={{
                  backgroundColor:
                    tagColor === "blue"
                      ? "var(--bg-tertiary)"
                      : "var(--bg-secondary)",
                  color:
                    tagColor === "blue"
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                }}
              >
                {item}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item);
                  }}
                  className="transition-colors hover:opacity-70"
                  style={{
                    color: "var(--text-tertiary)",
                  }}
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* INPUT */}
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
                className="flex-1 min-w-25 bg-transparent outline-none text-sm py-2"
                style={{
                  color: "var(--text-primary)",
                }}
                placeholder={isFocused ? placeholder : ""}
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                disabled={disabled}
              />
            )}

            {/* Indicateur de création en cours */}
            {isCreating && (
              <div className="flex items-center gap-1 px-2">
                <Loader2
                  className="w-3 h-3 animate-spin"
                  style={{ color: "var(--accent)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Création...
                </span>
              </div>
            )}
          </div>
        </fieldset>

        {/* DROPDOWN */}
        {isOpen && !disabled && (filteredItems.length > 0 || canCreate) && (
          <div
            className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border shadow-lg max-h-48 overflow-y-auto"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
            }}
          >
            {filteredItems.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSelectOption(item)}
                onMouseEnter={() => setActiveIndex(index)}
                className="block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-opacity-80"
                style={{
                  color: "var(--text-primary)",
                  backgroundColor:
                    activeIndex === index
                      ? "var(--bg-secondary)"
                      : "transparent",
                }}
              >
                {item}
              </button>
            ))}

            {canCreate && (
              <button
                type="button"
                onClick={() => handleSelectOption(trimmedSearch)}
                onMouseEnter={() => setActiveIndex(filteredItems.length)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors border-t hover:bg-opacity-80"
                style={{
                  color: "var(--accent)",
                  borderColor: "var(--border)",
                  backgroundColor:
                    activeIndex === filteredItems.length
                      ? "var(--bg-secondary)"
                      : "transparent",
                }}
                disabled={isAdding || isCreating}
              >
                {isAdding || isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>Créer «&nbsp;{trimmedSearch}&nbsp;»</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* État vide */}
        {isOpen &&
          !disabled &&
          trimmedSearch.length > 0 &&
          filteredItems.length === 0 &&
          !canCreate && (
            <div
              className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border shadow-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--text-tertiary)",
              }}
            >
              {isMaxReached && maxTags !== undefined ? (
                <span className="text-yellow-500">
                  Limite de {maxTags} tag{maxTags > 1 ? "s" : ""} atteinte
                </span>
              ) : (
                "Déjà sélectionné"
              )}
            </div>
          )}
      </div>

      {/* Message d'information */}
      {getLimitMessage() && (
        <p
          className={`text-xs ${isMaxReached ? "text-yellow-500" : ""}`}
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
