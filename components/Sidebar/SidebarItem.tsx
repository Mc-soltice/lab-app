"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { SidebarItemType } from "./types";

interface SidebarItemProps {
  item: SidebarItemType;
  active: boolean;
  collapsed?: boolean;
}

export default function SidebarItem({
  item,
  active,
  collapsed = false,
}: SidebarItemProps) {
  const Icon = item.icon;

  const formatBadge = (badge: string | number): string => {
    if (typeof badge === "number") {
      return badge > 99 ? "99+" : String(badge);
    }
    return badge;
  };

  const content = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium tracking-wide transition-all duration-300",
        active
          ? "bg-white/15 text-white shadow-lg"
          : "text-white/70 hover:bg-white/10 hover:text-white",
        collapsed && "justify-center px-2",
        !collapsed && "px-4",
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-all duration-300",
            active && "scale-110",
            !active && "group-hover:scale-110",
            collapsed && "h-6 w-6",
          )}
        />
      )}

      {!collapsed && <span className="flex-1">{item.label}</span>}

      {!collapsed && item.badge && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white",
            "bg-linear-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30",
            "transition-all duration-300",
            active && "scale-110",
          )}
        >
          {formatBadge(item.badge)}
        </span>
      )}

      {collapsed && item.badge && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg shadow-red-500/30">
          {formatBadge(item.badge)}
        </span>
      )}
    </Link>
  );

  // Si collapsed, on ajoute un tooltip pour le label
  if (collapsed) {
    return (
      <div className="relative group">
        {content}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {item.label}
        </div>
      </div>
    );
  }

  return content;
}
