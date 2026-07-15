"use client";

import { useTheme } from "@/contexts/theme/ThemeContext";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useActiveRoute } from "./hooks/useActiveRoute";
import { useUserRole } from "./hooks/useUserRole";
import { navigation } from "./navigation";
import SidebarFooter from "./SidebarFooter";
import SidebarGroup from "./SidebarGroup";
import SidebarItem from "./SidebarItem";
import SidebarLogo from "./SidebarLogo";

import type { SidebarItemType } from "./types";

export default function Sidebar() {
  const { isActiveRoute } = useActiveRoute();
  const userRole = useUserRole();
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Gérer le responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else if (width < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filtrer la navigation selon les rôles
  const filteredNavigation = useMemo(() => {
    const filterByRole = (items: SidebarItemType[]): SidebarItemType[] => {
      return items
        .filter((item) => {
          if (!item.roles) return true;
          return item.roles.includes(userRole);
        })
        .map((item) => {
          if (item.children) {
            return {
              ...item,
              children: filterByRole(item.children),
            };
          }
          return item;
        });
    };

    return filterByRole(navigation);
  }, [userRole]);

  // Déterminer si le sidebar est visible (largeur complète)
  const isExpanded = !isCollapsed || (isCollapsed && isHovered);

  // Contenu du sidebar
  const sidebarContent = (
    <div className="flex h-full flex-col">
      <SidebarLogo collapsed={!isExpanded} />

      <nav
        className="flex-1 space-y-2 overflow-y-auto"
        role="navigation"
        aria-label="Navigation principale"
      >
        {filteredNavigation.map((item) => {
          const isActive = isActiveRoute(item.href);

          if (item.children && item.children.length > 0) {
            return (
              <SidebarGroup
                key={item.href}
                item={item}
                active={isActive}
                collapsed={!isExpanded}
              />
            );
          }

          return (
            <SidebarItem
              key={item.href}
              item={item}
              active={isActive}
              collapsed={!isExpanded}
            />
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex w-full items-center ${
            isExpanded ? "justify-between" : "justify-center"
          } rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--text-secondary) transition hover:bg-white/10`}
          aria-label="Toggle theme"
          title={
            theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"
          }
        >
          <span
            className={`flex items-center gap-2 ${!isExpanded && "justify-center"}`}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {isExpanded && (
              <span>{theme === "light" ? "Mode sombre" : "Mode clair"}</span>
            )}
          </span>
          {isExpanded && (
            <span className="text-xs uppercase tracking-wide text-(--text-tertiary)">
              {theme === "light" ? "Dark" : "Light"}
            </span>
          )}
        </button>
      </div>

      <SidebarFooter collapsed={!isExpanded} />
    </div>
  );

  return (
    <>
      {/* Version Desktop - Sidebar collapsible */}
      <aside
        className={`hidden md:block sticky top-5 h-fit shrink-0 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl md:h-[calc(100vh-2rem)] transition-all duration-300 ease-in-out ${
          isExpanded ? "w-64" : "w-20"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {sidebarContent}
      </aside>

      {/* Version Mobile - Hamburger Menu */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-full bg-white/10 p-3 backdrop-blur-xl border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300"
          aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Drawer */}
        <aside
          className={`absolute top-0 right-0 h-full w-80 bg-white/10 backdrop-blur-xl border-l border-white/20 p-5 shadow-2xl transition-transform duration-300 ${
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
