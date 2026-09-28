// components/Sidebar/SidebarFooter.tsx
"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/cn";

interface SidebarFooterProps {
  collapsed?: boolean;
}

export default function SidebarFooter({ collapsed = false }: SidebarFooterProps) {
  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <div className="mt-2 border-t border-slate-200 px-3 pt-3 pb-3">
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Se déconnecter"
        className={cn(
          "group flex w-full items-center gap-3 rounded-md px-3 py-2.5",
          "text-slate-600 transition-colors duration-150",
          "hover:bg-rose-50 hover:text-rose-600",
          "focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:ring-offset-2",
          collapsed && "justify-center px-2",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
            "bg-slate-100 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-600",
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </div>

        {!collapsed && <span className="text-sm font-medium">Se déconnecter</span>}
      </button>
    </div>
  );
}
