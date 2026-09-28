// components/layout/Navbar.tsx
"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import {
  ChevronDown,
  Menu,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface NavLink {
  label: string;
  href: string;
  trending?: boolean;
}

interface NavColumn {
  title: string;
  links: NavLink[];
  /** Visual treatment for this column's links. Defaults to "bubble". */
  variant?: "bubble" | "plain";
}

interface NavItem {
  label: string;
  href: string;
  columns?: NavColumn[];
}

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  type: "article" | "product" | "service";
}

const SEARCH_DEBOUNCE_MS = 300;
const POPULAR_SEARCHES = [
  "Leadership",
  "Création d'entreprise",
  "Mode africaine",
  "Artisanat",
  "Formations",
];

// Mock index used to simulate suggestions until a real search endpoint exists.
const MOCK_INDEX: SearchSuggestion[] = [
  { id: "1", title: "Devenir une femme leader", category: "Blog LAB", type: "article" },
  {
    id: "2",
    title: "Créer son entreprise au Cameroun",
    category: "Blog LAB",
    type: "article",
  },
  {
    id: "3",
    title: "Coaching Virtuose Pro",
    category: "Virtuose Pro",
    type: "service",
  },
  { id: "4", title: "Robe wax sur-mesure", category: "Mode & Beauté", type: "product" },
  {
    id: "5",
    title: "Panier tressé artisanal",
    category: "Artisanat Local",
    type: "product",
  },
];

const CATEGORY_STYLES: Record<string, string> = {
  "Blog LAB": "text-amber-600 bg-amber-50",
  "Virtuose Pro": "text-rose-600 bg-rose-50",
  "Mode & Beauté": "text-purple-600 bg-purple-50",
  Boutique: "text-emerald-600 bg-emerald-50",
  "Artisanat Local": "text-orange-600 bg-orange-50",
};

const TYPE_ICONS: Record<SearchSuggestion["type"], React.ReactNode> = {
  article: <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />,
  service: <TrendingUp className="w-4 h-4 text-rose-500" aria-hidden="true" />,
  product: <ShoppingBag className="w-4 h-4 text-purple-500" aria-hidden="true" />,
};

// TODO: source from env / business settings instead of hardcoding.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "237XXXXXXXXX";

const navItems: NavItem[] = [
  {
    label: "Blog",
    href: "/blog",
    columns: [
      {
        title: "Contenus",
        links: [
          { label: "Magazine", href: "/blog" },
          { label: "Podcast", href: "/public_podcast" },
          { label: "E-book", href: "/public_ebook" },
        ],
      },
    ],
  },
  {
    label: "Boutique",
    href: "/boutique",
    columns: [
      {
        title: "Catégories",
        links: [
          { label: "Services Virtuose Pro", href: "/boutique/services" },
          { label: "Mode & Beauté", href: "/boutique/mode-beaute" },
          { label: "Artisanat Local", href: "/boutique/artisanat" },
        ],
      },
      {
        title: "Nouveautés",
        links: [
          { label: "Nouveaux produits", href: "/boutique/nouveautes", trending: true },
          { label: "Promotions", href: "/boutique/promotions" },
          { label: "Meilleures ventes", href: "/boutique/meilleures-ventes" },
        ],
      },
    ],
  },
  {
    label: "Fiscalité",
    href: "/fiscal",
    columns: [
      {
        title: "Impôts & Taxes",
        variant: "plain",
        links: [
          { label: "TVA — Taxe sur la Valeur Ajoutée", href: "/fiscal" },
          { label: "IS — Impôt sur les Sociétés", href: "/fiscal" },
          { label: "IRPP — Revenu des Personnes", href: "/fiscal" },
          { label: "DSF — Déclaration Annuelle", href: "/fiscal" },
          { label: "Patente professionnelle", href: "/fiscal" },
        ],
      },
      {
        title: "DGI & Conformité",
        variant: "plain",
        links: [
          { label: "Vérifier un NIU", href: "/fiscal" },
          { label: "Attestation de Conformité (ACF)", href: "/fiscal" },
          { label: "Avis d'Imposition DGI", href: "/fiscal" },
          { label: "TrésorPay — Payer un avis", href: "/fiscal" },
          { label: "Attestation de non-redevance", href: "/fiscal" },
        ],
      },
    ],
  },
  { label: "À propos", href: "/apropos" },
];

/** Debounces a fast-changing value; only the settled value is returned. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [headerOffset, setHeaderOffset] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthContext();

  const debouncedQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);

  // --- Scroll state for header styling ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Close the mobile menu on resize up to desktop ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Measure the promo banner so the header offset never goes stale ---
  useEffect(() => {
    if (!isBannerVisible) {
      setHeaderOffset(0);
      return;
    }
    const node = bannerRef.current;
    if (!node) return;

    const updateOffset = () => setHeaderOffset(node.offsetHeight);
    updateOffset();

    const observer = new ResizeObserver(updateOffset);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isBannerVisible]);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchSuggestions([]);
    setIsSearching(false);
  }, []);

  // --- Close any open overlay when clicking outside it, or on Escape ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) closeSearch();
      if (accountRef.current && !accountRef.current.contains(target)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (e.key === "Escape") {
        closeSearch();
        setIsAccountMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch]);

  // --- Simulated search: replace with a real API call when one exists ---
  useEffect(() => {
    const query = debouncedQuery.trim();
    if (!query) {
      setSearchSuggestions([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timeout = setTimeout(() => {
      const results = MOCK_INDEX.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchSuggestions(results);
      setIsSearching(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/recherche?q=${encodeURIComponent(query)}`);
    closeSearch();
  };

  const getCategoryColor = (category: string) =>
    CATEGORY_STYLES[category] ?? "text-gray-600 bg-gray-50";

  return (
    <>
      {isBannerVisible && (
        <div
          ref={bannerRef}
          className="top-banner font-montserrat fixed left-0 right-0 top-0 z-50"
        >
          <div className="container mx-auto px-4 lg:px-8 flex items-center justify-center py-2">
            <span>Promo&nbsp;: Inscription gratuite — Essayez Virtuose Pro</span>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="close-btn ml-3 p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label="Fermer la bannière promotionnelle"
            >
              <X className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <header
        className={`fixed left-0 right-0 z-40 transition-[top,background-color,box-shadow,padding] duration-500 ease-in-out ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
            : "bg-linear-to-r from-amber-50/90 via-white/90 to-rose-50/90 backdrop-blur-sm py-4"
        } font-montserrat`}
        style={{ top: headerOffset }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group shrink-0">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-linear-to-br from-amber-400 to-rose-400 rounded-2xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white font-bold text-lg lg:text-xl">B&V</span>
                </div>
                <div className="absolute -inset-1 bg-linear-to-br from-amber-400/20 to-rose-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div>
                <span className="block text-sm lg:text-base font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-rose-600">
                  BAL & Virtuose Pro
                </span>
                <span className="hidden lg:block text-[10px] text-gray-500 font-light tracking-wider">
                  Émancipation &amp; entrepreneuriat
                </span>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav
              className="hidden lg:flex items-center space-x-1"
              aria-label="Navigation principale"
            >
              {navItems.map((item) => {
                const isOpen = activeDropdown === item.label;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => item.columns && setActiveDropdown(item.label)}
                    onMouseLeave={() => item.columns && setActiveDropdown(null)}
                  >
                    {item.columns ? (
                      <>
                        <button
                          type="button"
                          aria-haspopup="true"
                          aria-expanded={isOpen}
                          onClick={() => setActiveDropdown(isOpen ? null : item.label)}
                          onFocus={() => setActiveDropdown(item.label)}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                            isOpen
                              ? "bg-linear-to-r from-amber-100 to-rose-100 text-amber-800 shadow-md"
                              : "text-gray-700 hover:bg-amber-50/50 hover:text-amber-700"
                          }`}
                        >
                          {item.label}
                          <ChevronDown
                            className={`ml-1 w-4 h-4 transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </button>

                        {/* Megamenu */}
                        <div
                          role="menu"
                          aria-label={`Sous-menu ${item.label}`}
                          className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 ${
                            item.columns.length === 1 ? "w-64" : "w-136"
                          } bg-white rounded-2xl shadow-[0_12px_40px_rgba(99,60,255,0.12)] border border-gray-100 transition-all duration-300 z-50 p-5 ${
                            isOpen
                              ? "opacity-100 visible translate-y-0"
                              : "opacity-0 invisible translate-y-1 pointer-events-none"
                          }`}
                          onMouseEnter={() => setActiveDropdown(item.label)}
                        >
                          <div className="flex gap-4">
                            {item.columns.map((column) => (
                              <div key={column.title} className="flex-1 min-w-52">
                                <div className="flex items-center gap-2 mb-3 px-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-linear-to-br from-violet-500 to-orange-400" />
                                  <h4 className="font-semibold text-sm text-gray-900">
                                    {column.title}
                                  </h4>
                                </div>

                                <ul className="flex flex-col gap-1">
                                  {column.links.map((link) => (
                                    <li key={link.label}>
                                      <Link
                                        href={link.href}
                                        role="menuitem"
                                        onClick={() => setActiveDropdown(null)}
                                        className="group/link flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none transition-colors duration-200"
                                      >
                                        {column.variant !== "plain" && (
                                          <span className="relative shrink-0 w-8 h-8 rounded-full p-0.5 bg-gray-200 group-hover/link:bg-linear-to-br group-hover/link:from-violet-500 group-hover/link:via-fuchsia-400 group-hover/link:to-orange-400 transition-all duration-300">
                                            <span className="w-full h-full rounded-full bg-white flex items-center justify-center text-[13px] font-medium text-gray-500 group-hover/link:text-violet-600 group-hover/link:scale-105 transition-all duration-300">
                                              {link.label.charAt(0)}
                                            </span>
                                          </span>
                                        )}

                                        <span
                                          className={`flex-1 text-[13px] group-hover/link:text-gray-900 font-medium transition-colors ${
                                            column.variant === "plain"
                                              ? "text-gray-700"
                                              : "text-gray-700"
                                          }`}
                                        >
                                          {link.label}
                                        </span>

                                        {link.trending && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-semibold whitespace-nowrap">
                                            🔥 Tendance
                                          </span>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          pathname === item.href
                            ? "text-amber-700 bg-amber-50/50"
                            : "text-gray-700 hover:bg-amber-50/50 hover:text-amber-700"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* WhatsApp Business */}
              <Link
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-green-600 bg-green-50 rounded-full hover:bg-green-100 hover:scale-110 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                aria-label="Contactez-nous sur WhatsApp"
              >
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:rotate-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </Link>

              {/* Panier */}
              <Link
                href="/panier"
                className="p-2.5 text-amber-600 bg-amber-50 rounded-full hover:bg-amber-100 hover:scale-110 transition-all duration-300 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Voir le panier"
              >
                <ShoppingBag
                  className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:-rotate-12"
                  aria-hidden="true"
                />
                {/* TODO: wire to real cart state once a cart context is available */}
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  0
                </span>
              </Link>

              {/* Espace Client */}
              {isAuthenticated ? (
                <div ref={accountRef} className="hidden sm:block relative">
                  <button
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    aria-haspopup="true"
                    aria-expanded={isAccountMenuOpen}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-amber-200/60 bg-white/90 hover:bg-amber-50 transition-all duration-300 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {user?.image ? (
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                        <Image src={user.image} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                        <User className="w-4 h-4" aria-hidden="true" />
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {user?.name || user?.username || "Mon espace"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                        isAccountMenuOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isAccountMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-amber-100 bg-white shadow-xl z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          Espace client
                        </p>
                      </div>
                      <Link
                        href="/post"
                        role="menuitem"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Mon espace
                      </Link>
                      <button
                        role="menuitem"
                        onClick={async () => {
                          setIsAccountMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors border-t border-gray-100"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-amber-500 to-rose-500 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <User
                    className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
                    aria-hidden="true"
                  />
                  <span>Espace Client</span>
                </Link>
              )}

              {/* Menu Mobile Button */}
              <button
                onClick={() => setIsMenuOpen((open) => !open)}
                className="lg:hidden p-2.5 text-gray-700 bg-white/80 backdrop-blur-sm rounded-full hover:bg-amber-50 hover:scale-105 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Mobile */}
          <div
            id="mobile-nav"
            className={`lg:hidden fixed inset-x-0 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-500 ease-in-out ${
              isMenuOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
            style={{
              top: "var(--header-height, 72px)",
              maxHeight: "calc(100vh - 72px)",
              overflowY: "auto",
            }}
          >
            <div className="container mx-auto px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <div key={item.label} className="space-y-2">
                  {item.columns ? (
                    <>
                      <div className="px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50/50 rounded-xl">
                        {item.label}
                      </div>
                      <div className="pl-4 space-y-3 border-l-2 border-amber-200 ml-2">
                        {item.columns.map((column) => (
                          <div key={column.title} className="space-y-1">
                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                              {column.title}
                            </p>
                            {column.links.map((link) => (
                              <Link
                                key={link.label}
                                href={link.href}
                                className="block px-4 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-linear-to-r hover:from-amber-50 hover:to-rose-50 hover:text-amber-700 transition-all duration-200"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        pathname === item.href
                          ? "text-amber-700 bg-amber-50/50"
                          : "text-gray-700 hover:bg-amber-50/50 hover:text-amber-700"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <Link
                href="/login"
                className="block px-4 py-3 mt-4 text-center bg-linear-to-r from-amber-500 to-rose-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="inline w-4 h-4 mr-2" aria-hidden="true" />
                Espace Client
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
