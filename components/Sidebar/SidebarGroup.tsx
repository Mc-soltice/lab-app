"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import SidebarItem from "./SidebarItem";

import type { SidebarItemType } from "./types";

interface SidebarGroupProps {
  item: SidebarItemType;

  /**
   * Lien actif unique déterminé par le Sidebar (findActiveRoute).
   *
   * Un seul onglet est stylé actif : c'est le href retourné par ce champ.
   */
  activeHref: string | null;
  collapsed?: boolean;
}

export default function SidebarGroup({
  item,
  activeHref,
  collapsed = false,
}: SidebarGroupProps) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const submenuId = `submenu-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

  // Un enfant du groupe est-il l'onglet actif ?
  const isChildActive =
    item.children?.some((child) => child.href === activeHref) ?? false;

  // Le groupe lui-même est actif SEULEMENT s'il est le lien actif sans qu'un
  // enfant ne le soit (cas "/dashboard" partagé entre le groupe et l'enfant
  // "Dashboard" : c'est l'enfant qui doit être stylé, pas le groupe).
  //
  // En mode replié, le bouton représente tout le groupe : il hérite donc de
  // l'état actif de ses enfants pour conserver un retour visuel.
  const active = collapsed
    ? isChildActive || item.href === activeHref
    : item.href === activeHref && !isChildActive;

  const [open, setOpen] = useState(active || isChildActive);

  useEffect(() => {
    if (active || isChildActive) {
      setOpen(true);
    }
  }, [active, isChildActive]);

  if (collapsed) {
    return (
      <div className="relative group">
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            active
              ? "bg-primary-dark text-white shadow-md shadow-primary/30"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "text-white" : "text-slate-500",
              )}
              aria-hidden="true"
            />
          )}
        </button>
        <div
          role="tooltip"
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
        >
          {item.label}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={submenuId}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-1 before:rounded-r-full before:transition-all before:duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          active
            ? "bg-amber-50 text-amber-700 before:bg-amber-700 before:opacity-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 before:bg-primary-dark/30 before:opacity-0 before:group-hover:opacity-100",
        )}
      >
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all duration-200",
              active
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-500 group-hover:bg-primary-dark/10 group-hover:text-primary-dark",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-all duration-200",
                active && "scale-110",
              )}
              aria-hidden="true"
            />
          </div>
        )}

        <span
          className={cn(
            "flex-1 text-left",
            active ? "text-amber-700" : "text-slate-700",
          )}
        >
          {item.label}
        </span>

        {hasChildren && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-all duration-300",
              active
                ? "text-amber-700"
                : "text-slate-400 group-hover:text-slate-600",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        )}
      </button>

      {hasChildren && (
        <div
          id={submenuId}
          role="region"
          aria-label={`Sous-menu ${item.label}`}
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="ml-3 space-y-1 border-l-2 border-slate-200/60 pl-3">
            {item.children?.map((child) => (
              <SidebarItem
                key={child.href}
                item={child}
                active={child.href === activeHref}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
