"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import { usePathname } from "next/navigation";
import AdminHeader from "../AdminHeader/AdminHeader";

const authPaths = ["/login", "/google-callback", "/error", "/profile"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen w-full flex-col md:flex-row md:items-stretch">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <div className="min-w-0 flex-1 bg-white p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
