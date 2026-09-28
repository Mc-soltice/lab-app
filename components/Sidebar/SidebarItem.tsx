// components/Sidebar/SidebarItem.tsx
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
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-[3px] before:rounded-r-sm before:transition-opacity before:duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "bg-blue-50 text-blue-700 before:bg-blue-600 before:opacity-100"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 before:bg-blue-600/30 before:opacity-0 before:group-hover:opacity-100",
        collapsed && "justify-center px-2",
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

      {!collapsed && (
        <span
          className={cn(
            "flex-1 text-left",
            active ? "text-blue-700" : "text-slate-700",
          )}
        >
          {item.label}
        </span>
      )}

      {!collapsed && item.badge && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
            "bg-rose-600 text-white",
          )}
        >
          {formatBadge(item.badge)}
        </span>
      )}

      {collapsed && item.badge && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold tabular-nums text-white ring-2 ring-white">
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
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
        >
          {item.label}
        </div>
      </div>
    );
  }

  return content;
}
