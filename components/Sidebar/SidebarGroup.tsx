"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import SidebarItem from "./SidebarItem";
import { useActiveRoute } from "./hooks/useActiveRoute";

import type { SidebarItemType } from "./types";

interface SidebarGroupProps {
  item: SidebarItemType;
  active: boolean;
  collapsed?: boolean;
}

export default function SidebarGroup({
  item,
  active,
  collapsed = false,
}: SidebarGroupProps) {
  const { isActiveRoute } = useActiveRoute();
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) {
      setOpen(true);
    }
  }, [active]);

  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const submenuId = `submenu-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

  // Si collapsed, on affiche juste l'icône avec un tooltip
  if (collapsed) {
    return (
      <div className="relative group">
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-center rounded-xl px-4 py-3",
            "text-sm font-medium transition-all duration-300",
            "cursor-pointer",
            active
              ? "bg-white/15 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white",
          )}
        >
          {Icon && <Icon className="h-6 w-6 shrink-0" />}
        </button>
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
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
          "group flex w-full items-center gap-4 rounded-xl px-4 py-3",
          "text-sm font-medium transition-all duration-300",
          "cursor-pointer",
          active
            ? "bg-white/15 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}

        <span className="flex-1 text-left">{item.label}</span>

        {hasChildren && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-300",
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
          <div className="ml-4 space-y-1 border-l border-white/10 pl-3">
            {item.children?.map((child) => (
              <SidebarItem
                key={child.href}
                item={child}
                active={isActiveRoute(child.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
