// components/Sidebar/SidebarGroup.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import SidebarItem from "./SidebarItem";

import type { SidebarItemType } from "./types";

interface SidebarGroupProps {
  item: SidebarItemType;
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

  const isChildActive =
    item.children?.some((child) => child.href === activeHref) ?? false;

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
            "flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            active
              ? "bg-blue-900 text-white"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
        </button>
        <div
          role="tooltip"
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
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
          "group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-[3px] before:rounded-r-sm before:transition-opacity before:duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          active
            ? "bg-blue-50 text-blue-700 before:bg-blue-600 before:opacity-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 before:bg-blue-600/30 before:opacity-0 before:group-hover:opacity-100",
        )}
      >
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
              active
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}

        <span
          className={cn(
            "flex-1 text-left",
            active ? "text-blue-700" : "text-slate-700",
          )}
        >
          {item.label}
        </span>

        {hasChildren && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              active ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600",
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
          <div className="ml-3 space-y-1 border-l-2 border-slate-200 pl-3">
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
