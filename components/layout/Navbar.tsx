// components/layout/Navbar.tsx
"use client";

import { useAuthContext } from "@/contexts/auth/auth.context";
import {
  ChevronDown,
  Clock,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface NavColumn {
  title: string;
  links: { label: string; href: string; trending?: boolean }[];
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
  icon?: React.ReactNode;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthContext();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Navigation items
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
            { label: "Nouveaux produits", href: "/boutique/nouveautes" },
            { label: "Promotions", href: "/boutique/promotions" },
            { label: "Meilleures ventes", href: "/boutique/meilleures-ventes" },
          ],
        },
      ],
    },
    { label: "À propos", href: "/apropos" },
  ];

  // Mock search data - À remplacer par une vraie API
  const mockData: SearchSuggestion[] = [
    {
      id: "1",
      title: "Comment lancer son business",
      category: "Blog LAB",
      type: "article",
    },
    {
      id: "2",
      title: "Services de secrétariat",
      category: "Virtuose Pro",
      type: "service",
    },
    {
      id: "3",
      title: "Tenues traditionnelles",
      category: "Mode & Beauté",
      type: "product",
    },
    {
      id: "4",
      title: "Artisanat local",
      category: "Boutique",
      type: "product",
    },
    {
      id: "5",
      title: "Webinaires leadership",
      category: "Blog LAB",
      type: "article",
    },
    {
      id: "6",
      title: "Formations comptabilité",
      category: "Virtuose Pro",
      type: "service",
    },
    {
      id: "7",
      title: "Bijoux artisanaux",
      category: "Artisanat Local",
      type: "product",
    },
    {
      id: "8",
      title: "Bien-être et spiritualité",
      category: "Blog LAB",
      type: "article",
    },
  ];

  // Effet pour le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu lors du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gérer le clic en dehors de la recherche
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gérer les raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K pour ouvrir la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      // Escape pour fermer
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchSuggestions([]);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // Gérer le dropdown au survol (desktop)
  const handleMouseEnter = (label: string) => {
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  // Simuler la recherche
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (query.trim().length === 0) {
      setSearchSuggestions([]);
      setIsSearching(false);
      return;
    }

    // Simulation de recherche avec délai
    setTimeout(() => {
      const filtered = mockData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchSuggestions(filtered.slice(0, 5));
      setIsSearching(false);
    }, 300);
  };

  // Soumettre la recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSearchSuggestions([]);
    }
  };

  // Navigation avec la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      handleSearchSubmit(e);
    }
  };

  // Couleurs des catégories
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Blog LAB": "text-amber-600 bg-amber-50",
      "Virtuose Pro": "text-rose-600 bg-rose-50",
      "Mode & Beauté": "text-purple-600 bg-purple-50",
      Boutique: "text-emerald-600 bg-emerald-50",
      "Artisanat Local": "text-orange-600 bg-orange-50",
    };
    return colors[category] || "text-gray-600 bg-gray-50";
  };

  // Icônes pour les types
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case "service":
        return <TrendingUp className="w-4 h-4 text-rose-500" />;
      case "product":
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      {isBannerVisible && (
        <div className="top-banner mb-5 font-montserrat fixed left-0 right-0 z-50">
          <div className="container mx-auto px-4 lg:px-8 flex items-center justify-center">
            <span>Promo: Inscription gratuite — Essayez Virtuose Pro</span>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="close-btn ml-3 p-1"
              aria-label="Fermer la bannière"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
            : "bg-linear-to-r from-amber-50/90 via-white/90 to-rose-50/90 backdrop-blur-sm py-4"
        } font-montserrat`}
        style={{ top: isBannerVisible ? "36px" : "0" }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group shrink-0">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-linear-to-br from-amber-400 to-rose-400 rounded-2xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white font-bold text-lg lg:text-xl">B&V</span>
                </div>
                <div className="absolute -inset-1 bg-linear-to-br from-amber-400/20 to-rose-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div>
                <span className="block text-sm lg:text-base font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-rose-600">
                  BAL & Virtuose Pro
                </span>
                <span className="hidden lg:block text-[10px] text-gray-500 font-light tracking-wider">
                  ÉMANCIPATION & ENTREPRENEURIAT
                </span>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.columns ? (
                    <>
                      <button
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                          activeDropdown === item.label
                            ? "bg-linear-to-r from-amber-100 to-rose-100 text-amber-800 shadow-md"
                            : "text-gray-700 hover:bg-amber-50/50 hover:text-amber-700"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          className={`ml-1 w-4 h-4 transition-transform duration-300 ${
                            activeDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Megamenu — style réseau social */}
                      <div
                        className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 ${
                          item.columns && item.columns.length === 1
                            ? "w-64"
                            : "w-[34rem]"
                        } bg-white rounded-2xl shadow-[0_12px_40px_rgba(99,60,255,0.12)] border border-gray-100
  opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-1
  transition-all duration-300 z-50 p-5
  ${activeDropdown === item.label ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1"}`}
                      >
                        <div className="flex gap-4">
                          {item.columns.map((column, colIndex) => (
                            <div key={column.title} className="flex-1 min-w-[13rem]">
                              <div className="flex items-center gap-2 mb-3 px-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-violet-500 to-orange-400" />
                                <h4 className="font-semibold text-sm text-gray-900">
                                  {column.title}
                                </h4>
                              </div>

                              <ul className="flex flex-col gap-1">
                                {column.links.map((link, i) => (
                                  <li key={link.label}>
                                    <Link
                                      href={link.href}
                                      onClick={() => setIsMenuOpen(false)}
                                      className="group/link flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                                    >
                                      {/* Bulle icône avec anneau dégradé façon story */}
                                      <span className="relative shrink-0 w-8 h-8 rounded-full p-[2px] bg-gray-200 group-hover/link:bg-gradient-to-br group-hover/link:from-violet-500 group-hover/link:via-fuchsia-400 group-hover/link:to-orange-400 transition-all duration-300">
                                        <span className="w-full h-full rounded-full bg-white flex items-center justify-center text-[13px] font-medium text-gray-500 group-hover/link:text-violet-600 group-hover/link:scale-105 transition-all duration-300">
                                          {link.label.charAt(0)}
                                        </span>
                                      </span>

                                      <span className="flex-1 text-[13px] text-gray-700 group-hover/link:text-gray-900 font-medium transition-colors">
                                        {link.label}
                                      </span>

                                      {/* Badge tendance — optionnel, sur un lien marqué */}
                                      {link.trending && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-semibold whitespace-nowrap">
                                          🔥 Trend
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
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        pathname === item.href
                          ? "text-amber-700 bg-amber-50/50"
                          : "text-gray-700 hover:bg-amber-50/50 hover:text-amber-700"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Fiscalité Hover Dropdown (Premium Detail) */}
              <div className="group relative">
                <button className="text-gray-700 hover:text-amber-700 transition-all flex items-center gap-1 cursor-pointer px-4 py-2 text-sm font-medium rounded-full hover:bg-amber-50/50">
                  Fiscalité
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max min-w-120 bg-white border border-gray-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-6 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
                  <div className="grid grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="font-display text-base font-semibold text-amber-800 mb-3">
                        Impôts & Taxes
                      </h4>
                      <ul className="flex flex-col gap-2 text-xs">
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            TVA — Taxe sur la Valeur Ajoutée
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            IS — Impôt sur les Sociétés
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            IRPP — Revenu des Personnes
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            DSF — Déclaration Annuelle
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            Patente professionnelle
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-display text-base font-semibold text-amber-800 mb-3">
                        DGI & Conformité
                      </h4>
                      <ul className="flex flex-col gap-2 text-xs">
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            Vérifier un NIU
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            Attestation de Conformité (ACF)
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            Avis d'Imposition DGI
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            TrésorPay — Payer avis
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/fiscal"
                            className="text-gray-700 hover:text-amber-700 transition-colors"
                          >
                            Attestation non-redevance
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* Barre de recherche */}
              <div ref={searchRef} className="relative">
                {/* Bouton de recherche */}
                <button
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (!isSearchOpen) {
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }
                  }}
                  className="p-2.5 text-amber-600 bg-amber-50 rounded-full hover:bg-amber-100 hover:scale-110 transition-all duration-300 group"
                  aria-label="Rechercher"
                >
                  <Search className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:rotate-12" />
                </button>

                {/* Overlay de recherche */}
                {isSearchOpen && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200">
                    <div className="absolute top-0 left-0 right-0 p-4 lg:p-6">
                      <div className="max-w-3xl mx-auto">
                        {/* Conteneur de recherche */}
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100/50 animate-in slide-in-from-top-4 duration-300">
                          {/* Header de recherche */}
                          <div className="flex items-center justify-between p-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <Search className="w-5 h-5 text-amber-500" />
                              <span className="text-sm font-medium text-gray-700">
                                Recherche rapide
                              </span>
                              <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                Ctrl+K
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setSearchSuggestions([]);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <X className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>

                          {/* Input de recherche */}
                          <form onSubmit={handleSearchSubmit} className="p-3">
                            <div className="relative">
                              <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Rechercher un article, un produit, un service..."
                                className="w-full px-4 py-3 pr-12 text-base bg-gray-50 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-200"
                                autoFocus
                              />
                              {searchQuery && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery("");
                                    setSearchSuggestions([]);
                                    inputRef.current?.focus();
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                  <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                              )}
                            </div>
                          </form>

                          {/* Suggestions */}
                          {(searchSuggestions.length > 0 || isSearching) && (
                            <div className="border-t border-gray-100 max-h-80 overflow-y-auto">
                              {isSearching ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
                                  <span className="ml-2 text-sm text-gray-500">
                                    Recherche en cours...
                                  </span>
                                </div>
                              ) : (
                                <div className="p-2 space-y-1">
                                  {/* Résultats */}
                                  {searchSuggestions.map((item) => (
                                    <Link
                                      key={item.id}
                                      href={`/recherche?q=${encodeURIComponent(item.title)}`}
                                      className="flex items-center justify-between p-3 rounded-xl hover:bg-linear-to-r hover:from-amber-50 hover:to-rose-50 transition-all duration-200 group"
                                      onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery("");
                                        setSearchSuggestions([]);
                                      }}
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="shrink-0">
                                          {getTypeIcon(item.type)}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm text-amber-800 font-medium truncate group-hover:text-amber-700 transition-colors">
                                            {item.title}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span
                                              className={`text-[10px] px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}
                                            >
                                              {item.category}
                                            </span>
                                            <span className="text-[10px] text-gray-400 capitalize">
                                              {item.type}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <Search className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </Link>
                                  ))}

                                  {/* Voir tous les résultats */}
                                  {searchSuggestions.length > 0 && (
                                    <button
                                      onClick={handleSearchSubmit}
                                      className="w-full mt-2 p-3 text-center text-sm font-medium text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                                    >
                                      Voir tous les résultats pour "{searchQuery}"
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Message quand aucun résultat */}
                          {searchQuery &&
                            !isSearching &&
                            searchSuggestions.length === 0 && (
                              <div className="p-8 text-center border-t border-gray-100">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">
                                  Aucun résultat trouvé
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                  Essayez d'autres mots-clés ou consultez notre
                                  catalogue
                                </p>
                              </div>
                            )}

                          {/* Suggestion rapides (quand pas de recherche) */}
                          {!searchQuery && !isSearching && (
                            <div className="p-4 border-t border-gray-100">
                              <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Recherches populaires
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  "Leadership",
                                  "Création d'entreprise",
                                  "Mode africaine",
                                  "Artisanat",
                                  "Formations",
                                ].map((term) => (
                                  <button
                                    key={term}
                                    onClick={() => {
                                      setSearchQuery(term);
                                      handleSearch(term);
                                    }}
                                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-100 rounded-full transition-colors text-gray-700 hover:text-amber-700"
                                  >
                                    {term}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp Business */}
              <Link
                href="https://wa.me/237XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-green-600 bg-green-50 rounded-full hover:bg-green-100 hover:scale-110 transition-all duration-300 group"
                aria-label="Contactez-nous sur WhatsApp"
              >
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:rotate-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </Link>

              {/* Panier */}
              <Link
                href="/panier"
                className="p-2.5 text-amber-600 bg-amber-50 rounded-full hover:bg-amber-100 hover:scale-110 transition-all duration-300 relative group"
              >
                <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:-rotate-12" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* Espace Client */}
              {isAuthenticated ? (
                <div className="hidden sm:block relative">
                  <button
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-amber-200/60 bg-white/90 hover:bg-amber-50 transition-all duration-300 shadow-sm"
                  >
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt="Avatar utilisateur"
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                        <User className="w-4 h-4" />
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {user?.name || user?.username || "Mon espace"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>

                  {isAccountMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-amber-100 bg-white shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          Espace client
                        </p>
                      </div>
                      <Link
                        href="/post"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        onClick={() => setIsAccountMenuOpen(false)}
                      >
                        Mon espace
                      </Link>
                      <button
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
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-amber-500 to-rose-500 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 transition-all duration-300 group"
                >
                  <User className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                  <span>Espace Client</span>
                </Link>
              )}

              {/* Menu Mobile Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 text-gray-700 bg-white/80 backdrop-blur-sm rounded-full hover:bg-amber-50 hover:scale-105 transition-all duration-300"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Navigation Mobile */}
          <div
            className={`lg:hidden fixed inset-x-0 top-18 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-500 ease-in-out ${
              isMenuOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
            style={{ maxHeight: "calc(100vh - 72px)", overflowY: "auto" }}
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

              {/* Mobile Client Button */}
              <Link
                href="/login"
                className="block px-4 py-3 mt-4 text-center bg-linear-to-r from-amber-500 to-rose-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="inline w-4 h-4 mr-2" />
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
