"use client";

import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user as any | undefined;

  const displayName = user?.username || user?.name || "John Doe";
  const avatar = user?.avatar || user?.image || null;
  const role = String(user?.role || "BLOGGER");

  const initials = useMemo(() => {
    const parts = String(displayName).trim().split(/\s+/);
    if (parts.length === 0) return "JD";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  return (
    <header className="font-montserrat sticky top-0 z-10 rounded-full border border-amber-100 bg-white/90 shadow-sm shadow-amber-100/60 backdrop-blur-xl sm:top-4 sm:p-2 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={displayName}
                  width={12}
                  height={12}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-200"
                />
              ) : (
                <div className="h-12 w-8 rounded-full bg-linear-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-semibold shadow-lg">
                  {initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {displayName}
              </span>
              <span className="block text-[11px] text-amber-700">{role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative rounded-full border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-amber-700"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-0.2 flex h-2 w-2 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white" />
          </Link>
        </div>
      </div>
    </header>
  );
}
