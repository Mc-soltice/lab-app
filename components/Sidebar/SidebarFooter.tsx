"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/cn";

interface SidebarFooterProps {
  collapsed?: boolean;
}

export default function SidebarFooter({
  collapsed = false,
}: SidebarFooterProps) {
  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <div className="mt-2 border-t border-slate-200/60 px-3 pt-3">
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Se déconnecter"
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
          "text-slate-600 transition-all duration-200",
          "hover:bg-linear-to-r hover:from-red-50/80 hover:to-red-50/40 hover:text-red-600",
          "focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:ring-offset-2",
          collapsed && "justify-center px-2",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
            "bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600",
          )}
        >
          <LogOut
            className="h-4 w-4 transition-all duration-200 group-hover:scale-110"
            aria-hidden="true"
          />
        </div>

        {!collapsed && (
          <span className="text-sm font-medium">Se déconnecter</span>
        )}
      </button>
    </div>
  );
}
