import ProductImage from "@/components/ProductImage";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

// Composant pour gérer le clic en dehors
function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// Composants clients extraits
function MobileMenuButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ouvrir le menu admin"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-gray-600 transition hover:bg-slate-50 lg:hidden"
    >
      {isOpen ? (
        <X className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Menu className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

function SearchInput({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-300/40",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher…"
        className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

function NotificationButton() {
  return (
    <button
      type="button"
      aria-label="Notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-gray-500 transition hover:bg-slate-50"
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
    </button>
  );
}

function ProfileDropdown({
  isOpen,
  onToggle,
  onClose,
  user,
  displayName,
  initials,
  logout,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  user: any;
  displayName: string;
  initials: string;
  logout: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useClickOutside(dropdownRef, onClose);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex max-w-45 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-slate-50 sm:max-w-none sm:px-3"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-gray-600 ring-1 ring-slate-200">
          {user?.image ? (
            <ProductImage
              src={user.image}
              alt={displayName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold">{initials}</span>
          )}
        </span>
        <span className="hidden min-w-0 truncate lg:inline">{displayName}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-200 px-3 py-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-gray-600 ring-1 ring-slate-200">
              {user?.image ? (
                <ProductImage
                  src={user.image}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {displayName}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user?.email || "admin@lab.app"}
              </p>
            </div>
          </div>

          <nav className="flex flex-col p-1.5">
            <Link
              href="/admin/settings"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-slate-50 hover:text-gray-900"
              onClick={onClose}
            >
              <Settings className="h-4 w-4 text-gray-400" aria-hidden="true" />
              Paramètres
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Se déconnecter
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function MobileNavigation({
  isOpen,
  onClose,
  search,
  setSearch,
}: {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="border-t border-slate-200 bg-white lg:hidden">
      <div className="flex flex-col gap-3 px-4 py-4">
        <SearchInput value={search} onChange={setSearch} className="w-full" />

        <div className="grid grid-cols-2 gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-slate-50 hover:text-gray-900"
              onClick={onClose}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const CRUMB_LABELS: Record<string, string> = {
  dashboard: "Tableau de bord",
  posts: "Articles",
  podcasts: "Podcasts",
  books: "Livres",
  users: "Utilisateurs",
  create: "Créer",
  edit: "Modifier",
};

function PageBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const isRootDashboard = segments.length === 1 && segments[0] === "dashboard";

  const crumbs = isRootDashboard
    ? [{ label: "Tableau de bord", href: "/dashboard" }]
    : segments.slice(1).map((segment, index) => ({
        label:
          CRUMB_LABELS[segment] ??
          `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`,
        href: `/${segments.slice(0, index + 2).join("/")}`,
      }));

  return (
    <nav
      aria-label="Fil d'ariane"
      className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex"
    >
      <Link
        href="/dashboard"
        className={
          isRootDashboard
            ? "font-semibold text-gray-900"
            : "font-medium text-gray-500 transition hover:text-gray-900"
        }
      >
        Administration
      </Link>
      {crumbs.map((crumb, index) => (
        <Fragment key={crumb.href}>
          <ChevronRight
            className="h-3.5 w-3.5 shrink-0 text-gray-300"
            aria-hidden="true"
          />
          {index === crumbs.length - 1 ? (
            <span className="min-w-0 truncate font-semibold text-gray-900">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="shrink-0 font-medium text-gray-500 transition hover:text-gray-900"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

const navLinks = [
  { name: "Tableau de bord", href: "/dashboard" },
  { name: "Articles", href: "/dashboard/posts" },
  { name: "Podcasts", href: "/dashboard/podcasts" },
  { name: "Livres", href: "/dashboard/books" },
  { name: "Utilisateurs", href: "/dashboard/users" },
];

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "Administrateur";

  const initials = useMemo(() => {
    const parts = String(displayName).trim().split(/\s+/);
    if (parts.length === 0) return "AD";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  // Fermer le dropdown quand on appuie sur Echap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          <PageBreadcrumb />
        </div>

        <div className="flex items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            className="hidden md:flex w-52 xl:w-64"
          />
          <NotificationButton />
          <ProfileDropdown
            isOpen={isProfileOpen}
            onToggle={() => setIsProfileOpen(!isProfileOpen)}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            displayName={displayName}
            initials={initials}
            logout={logout}
          />
        </div>
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        search={search}
        setSearch={setSearch}
      />
    </header>
  );
}
