import Link from "next/link";

interface SidebarLogoProps {
  collapsed?: boolean;
}

export default function SidebarLogo({ collapsed = false }: SidebarLogoProps) {
  return (
    <Link
      href="/"
      className={`mb-8 block rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-lg transition-all duration-300 hover:scale-[1.02] ${
        collapsed ? "p-3" : "p-4"
      }`}
    >
      <div
        className={`flex items-center justify-center ${
          collapsed ? "h-10" : "h-12"
        }`}
      >
        {collapsed ? (
          <span className="text-xl font-bold tracking-wide text-white">L</span>
        ) : (
          <span className="text-lg font-bold tracking-wide text-white">
            LAB APP
          </span>
        )}
      </div>
    </Link>
  );
}
