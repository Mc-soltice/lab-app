"use client";

import { ChevronsLeft, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { canAccessAdmin } from "@/lib/auth/permissions";

import { useActiveRoute } from "./hooks/useActiveRoute";
import { navigation } from "./navigation";
import SidebarGroup from "./SidebarGroup";
import SidebarFooter from "./SidebarFooter";
import SidebarItem from "./SidebarItem";
import type { SidebarItemType, UserRole } from "./types";

// ---------------------------------------------------------------------------
// Filtrage par rôle
// ---------------------------------------------------------------------------
function filterByRole(items: SidebarItemType[], role?: string): SidebarItemType[] {
  return items
    .filter((item) => {
      if (item.label === "Administration") {
        return canAccessAdmin(role);
      }

      if (item.roles && item.roles.length > 0) {
        return item.roles.includes(role as UserRole);
      }

      return true;
    })
    .map((item) => {
      if (item.label === "Administration") {
        return item;
      }

      return {
        ...item,
        children: item.children ? filterByRole(item.children, role) : undefined,
      };
    });
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps = {}) {
  const { user } = useAuth();
  const { findActiveRoute } = useActiveRoute();
  const [pinned, setPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const collapsed = !pinned && !isHovered;

  const visibleItems = filterByRole(navigation, user?.role);

  // Aplatit tous les liens (y compris les sous-menus), puis détermine
  // UN SEUL onglet actif : correspondance exacte d'abord, sinon le
  // préfixe le plus long (ex. "/dashboard/podcasts" gagne sur "/dashboard")
  const allRoutes: { href: string }[] = [];
  const collectRoutes = (items: SidebarItemType[]) => {
    items.forEach((item) => {
      allRoutes.push({ href: item.href });
      if (item.children) {
        collectRoutes(item.children);
      }
    });
  };
  collectRoutes(visibleItems);
  const activeHref = findActiveRoute(allRoutes);

  const mainItems = visibleItems.filter((item) => item.label !== "Administration");
  const adminItem = visibleItems.find((item) => item.label === "Administration");

  const renderNavGroup = (item: SidebarItemType) =>
    item.children && item.children.length > 0 ? (
      <SidebarGroup
        key={item.href}
        item={item}
        activeHref={activeHref}
        collapsed={collapsed}
      />
    ) : (
      <SidebarItem
        key={item.href}
        item={item}
        active={item.href === activeHref}
        collapsed={collapsed}
      />
    );

  const content = (
    <div className="font-montserrat flex h-full flex-col bg-white">
      {/* En-tête avec logo */}
      <div
        className={`flex items-center gap-2 px-4 pt-5 pb-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-3 px-1">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white ring-1 ring-primary-dark/20 shadow-sm">
              <span className="text-base font-black tracking-tight">L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-slate-800 tracking-tight">
                AB APP
              </span>
              <span className="text-[10px] font-medium text-primary-dark/70">
                Plateforme
              </span>
            </div>
          </div>
        ) : (
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white ring-1 ring-primary-dark/20 shadow-sm">
            <span className="text-base font-black tracking-tight">L</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setPinned((p) => !p)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
            title="Réduire le menu"
            aria-label="Réduire le menu"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setPinned(true)}
          className="hidden md:flex mx-auto mb-2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 rotate-180"
          title="Déplier le menu"
          aria-label="Déplier le menu"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {/* Navigation principale */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </p>
              <div className="mt-1 h-px bg-linear-to-r from-slate-200 to-transparent" />
            </div>
          )}
          {mainItems.map(renderNavGroup)}
        </div>

        {/* Zone Administration */}
        {adminItem && (
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Administration
                </p>
                <div className="mt-1 h-px bg-linear-to-r from-slate-200 to-transparent" />
              </div>
            )}
            {renderNavGroup(adminItem)}
          </div>
        )}
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </div>
  );

  return (
    <div className="bg-white md:min-h-screen">
      {/* Desktop */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:block sticky top-0 h-screen shrink-0 border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out ${
          collapsed ? "w-18" : "w-72"
        }`}
      >
        {content}
      </aside>

      {/* Tiroir mobile */}
      <div
        className={`md:hidden fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"}`}
        role="dialog"
        aria-modal="true"
      >
        <div
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-md transition-all duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-[320px] bg-white shadow-2xl transition-all duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200/60 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white ring-1 ring-primary-dark/20 shadow-sm">
                <span className="text-sm font-black">L</span>
              </div>
              <span className="text-sm font-bold text-slate-800">AB APP</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="h-[calc(100%-60px)] overflow-y-auto">{content}</div>
        </aside>
      </div>
    </div>
  );
}
