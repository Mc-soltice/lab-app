"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import { usePathname } from "next/navigation";

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
    <div className="flex  min-h-screen items-center justify-center p-2 sm:p-4 md:p-5">
      <div className="flex w-full flex-col gap-2 sm:gap-4 md:flex-row xl:mx-32 2xl:mx-60">
        <Sidebar />

        <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
          <Header />
          {children}
        </div>
      </div>
    </div>
  );
}
