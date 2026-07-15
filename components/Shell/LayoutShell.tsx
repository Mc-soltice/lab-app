"use client";

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
      <div className="flex min-h-screen xl:mx-32 2xl:mx-60">
        {sidebarComponent || <Sidebar />}
        <main className={`flex-1 ${className}`}>{children}</main>
      </div>
    );
  }

  // Header + Sidebar (complet)
  return (
    <div className="flex min-h-screen items-center justify-center p-2 sm:p-4 md:p-5">
      <div className="flex w-full flex-col gap-2 sm:gap-4 md:flex-row xl:mx-32 2xl:mx-60">
        {sidebarComponent || <Sidebar />}
        <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
          {headerComponent || <Header />}
          <main className={className}>{children}</main>
        </div>
      </div>
    </div>
  );
}
