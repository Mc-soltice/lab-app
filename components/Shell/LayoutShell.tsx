"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ReactNode } from "react";

interface LayoutShellProps {
  children: ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  headerComponent?: ReactNode; // Pour header personnalisé
  sidebarComponent?: ReactNode; // Pour sidebar personnalisé
  className?: string;
}

export default function LayoutShell({
  children,
  showHeader = true,
  showSidebar = true,
  headerComponent,
  sidebarComponent,
  className = "",
}: LayoutShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Si rien n'est affiché, retourner juste les enfants
  if (!showHeader && !showSidebar) {
    return <>{children}</>;
  }

  // Si seulement le header
  if (showHeader && !showSidebar) {
    return (
      <div className="flex min-h-screen flex-col">
        {headerComponent || <Header />}
        <main className={className}>{children}</main>
      </div>
    );
  }

  // Si seulement le sidebar
  if (!showHeader && showSidebar) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row xl:mx-32 2xl:mx-60">
        <div className="border-b border-slate-200/80 bg-white/80 p-3 backdrop-blur-sm md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700 shadow-sm shadow-amber-100/60 transition-all duration-200 hover:bg-amber-50 hover:text-amber-800"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {sidebarComponent || (
          <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        )}
        <main className={`flex-1 md:pl-0 ${className}`}>{children}</main>
      </div>
    );
  }

  // Header + Sidebar (complet)
  return (
    <div className="flex min-h-screen items-start justify-start p-0 sm:p-4 md:items-center md:justify-center md:p-5">
      <div className="flex w-full flex-col gap-2 sm:gap-4 md:flex-row ">
        {sidebarComponent || (
          <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        )}
        <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
          <div className="flex items-stretch gap-2">
            {/* Bouton mobile - à côté du header */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700 shadow-sm shadow-amber-100/60 transition-all duration-200 hover:bg-amber-50 hover:text-amber-800"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">{headerComponent || <Header />}</div>
          </div>
          <main className={className}>{children}</main>
        </div>
      </div>
    </div>
  );
}
