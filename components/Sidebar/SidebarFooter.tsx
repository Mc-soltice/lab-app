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
    <div className="mt-6 border-t border-white/10 pt-6">
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Se déconnecter"
        className={cn(
          "group flex w-full items-center gap-4 rounded-xl px-4 py-3",
          "text-red-300 transition-all duration-300",
          "hover:bg-red-500/10 hover:text-red-400",
          "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-transparent",
          collapsed && "justify-center px-2",
        )}
      >
        <LogOut
          className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        />

        {!collapsed && (
          <span className="text-sm font-medium">Se déconnecter</span>
        )}
      </button>
    </div>
  );
}
