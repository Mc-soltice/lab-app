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
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-1 before:rounded-r-full before:transition-all before:duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        // État actif : texte et barre en amber-700
        active
          ? "bg-amber-50 text-amber-700 before:bg-amber-700 before:opacity-100"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 before:bg-primary-dark/30 before:opacity-0 before:group-hover:opacity-100",
        collapsed && "justify-center px-2",
      )}
    >
      {Icon && (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all duration-200",
            // État actif : icône en amber-700
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

      {/* Label toujours visible avec bon contraste */}
      {!collapsed && (
        <span
          className={cn(
            "flex-1 text-left transition-all duration-200 group-hover:translate-x-0.5",
            active ? "text-amber-700" : "text-slate-700",
          )}
        >
          {item.label}
        </span>
      )}

      {!collapsed && item.badge && (
        <span
          className={cn(
            "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold",
            active
              ? "bg-amber-700 text-white"
              : "bg-amber-500 text-white shadow-md shadow-amber-500/30",
          )}
        >
          {formatBadge(item.badge)}
        </span>
      )}

      {collapsed && item.badge && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white ring-2 ring-white shadow-lg shadow-amber-500/30">
          {formatBadge(item.badge)}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <div className="relative group">
        {content}
        <div
          role="tooltip"
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
        >
          {item.label}
        </div>
      </div>
    );
  }

  return content;
}
