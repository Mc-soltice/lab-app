"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/contexts/theme/ThemeContext";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export default function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
        "text-slate-600 transition-all duration-200",
        "hover:bg-slate-50 hover:text-slate-900",
        "focus:outline-none focus:ring-2 focus:ring-primary-dark/30 focus:ring-offset-2",
        collapsed && "justify-center px-2",
      )}
      aria-label={
        theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"
      }
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          "bg-slate-100 text-slate-500 group-hover:bg-primary-dark/10 group-hover:text-primary-dark",
          collapsed && "mx-auto",
        )}
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
        ) : (
          <Sun className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
        )}
      </div>
      {!collapsed && (
        <span>{theme === "light" ? "Mode sombre" : "Mode clair"}</span>
      )}
      {!collapsed && (
        <span className="ml-auto text-xs font-medium uppercase tracking-wider text-slate-400">
          {theme === "light" ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
