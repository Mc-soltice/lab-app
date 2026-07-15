"use client";

import { useTheme } from "@/contexts/theme/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductImage from "./ProductImage";
import { ActionButton } from "./blog/ActionButton";

const navLinks = [
  { name: "Actualites", url: "/blog" },
  { name: "Podcast", url: "/blog/podcast" },
  { name: "Abonnement", url: "/blog/suivie" },
  { name: "Livre", url: "/blog/livre" },
  { name: "Admin", url: "/blog/admin" },
];
// const navLinks = [
//   { name: "Blog", url: "/blog" },
//   { name: "Boutique", url: "/boutique" },
//   { name: "E-Learning", url: "/elearning" },
//   { name: "Partenaire", url: "/partenaire" },
//   { name: "À propos", url: "/a-propos" },
// ];

export default function Navbar() {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [active, setActive] = useState("Travel");
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  // Utilisation du hook useAuth
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 px-4 sm:px-6 md:px-7 py-3 sm:py-4 bg-(--bg-secondary)/80 backdrop-blur-md">
        {/* Container principal - mobile first */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo - toujours visible */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-(--bg-tertiary) backdrop-blur-sm rounded-md flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5 text-(--text-primary)"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13 3C8.03 3 4 7.03 4 12H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
              </svg>
            </div>
            <span className="text-base sm:text-[17px] font-semibold text-(--text-primary) tracking-tight">
              Virtual&amp;Lab<span className="text-(--accent)">Pro</span>
            </span>
          </Link>

          {/* Nav Links - caché sur mobile, visible sur tablette/desktop */}
          <ul className="hidden md:flex items-center gap-1 ml-6 list-none">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.url}
                  onClick={() => setActive(link.name)}
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-block ${
                    active === link.name
                      ? "bg-(--bg-tertiary) text-(--text-primary)"
                      : "text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search Bar - visible uniquement sur tablette et desktop */}
          <div className="hidden sm:flex flex-1 max-w-70 mx-3 md:mx-5">
            <div className="flex items-center gap-2 bg-(--bg-tertiary) border border-(--border) rounded-xl px-3.5 py-2 focus-within:bg-(--bg-secondary) focus-within:border-(--accent) focus-within:shadow-sm transition-all group w-full">
              <Search className="w-4 h-4 text-(--text-secondary) shrink-0 group-focus-within:text-(--text-primary)" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destination..."
                className="bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:text-(--text-primary) focus:placeholder:text-(--text-secondary) w-full font-[inherit]"
              />
            </div>
          </div>

          {/* Right Side - visible uniquement sur tablette et desktop */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <ActionButton
              isReadingMode={isReadingMode}
              onToggle={() => {
                setIsReadingMode(!isReadingMode);
                router.push("/blog/post");
              }}
              isNavigating={false}
            />
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-(--bg-tertiary) transition-colors cursor-pointer"
              aria-label="Toggle theme"
              title={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-(--text-secondary)" />
              ) : (
                <Sun className="w-4 h-4 text-(--text-secondary)" />
              )}
            </button>
            {/* Language */}
            <button className="flex items-center gap-1.5 text-sm font-medium text-(--text-secondary) px-2.5 py-1.5 rounded-lg hover:bg-(--bg-tertiary) transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">EN</span>
            </button>

            <div className="w-px h-5 bg-white/25" />

            {/* User Section - Connecté ou non */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-r from-rose-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                    {user.image ? (
                      <ProductImage
                        src={user.image}
                        alt={user.name || "User"}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <span className="hidden lg:inline">
                    {user.name?.split(" ")[0] || "Utilisateur"}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-(--bg-secondary)/95 backdrop-blur-sm rounded-lg shadow-lg border border-(--border)/80 z-50 py-1">
                      <div className="px-4 py-3 border-b border-(--border) flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-rose-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
                          {user.image ? (
                            <ProductImage
                              src={user.image}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getUserInitials()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-(--text-primary) truncate">
                            {user.name || "Utilisateur"}
                          </p>
                          <p className="text-xs text-(--text-secondary) truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Mon Profil
                      </Link>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Tableau de bord
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Paramètres
                      </Link>
                      <div className="border-t border-(--border) mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-(--color-danger) hover:bg-(--bg-tertiary) transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white px-3.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  href="/login?mode=register"
                  className="text-sm font-semibold text-white bg-linear-to-r from-rose-500 to-purple-600 backdrop-blur-sm px-4 py-1.5 rounded-[9px] hover:bg-black/80 active:scale-95 transition-all cursor-pointer inline-block whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Menu Burger - visible uniquement sur mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`sm:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 ${
              isMobileMenuOpen
                ? "opacity-0 invisible scale-75"
                : "opacity-100 visible scale-100"
            }`}
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </nav>

      {/* Menu Mobile Overlay - Animation complète à l'ouverture et fermeture */}
      <div
        className={`
          fixed inset-0 z-40 sm:hidden
          transition-all duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "bg-black/60 backdrop-blur-sm opacity-100 visible"
              : "bg-black/0 backdrop-blur-none opacity-0 invisible"
          }
        `}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Menu Panel */}
        <div
          className={`
            fixed top-0 right-0 h-full w-64 
            bg-linear-to-b from-white/15 to-white/5 
            backdrop-blur-xl z-50 sm:hidden shadow-2xl 
            border-l border-white/20
            transition-all duration-500 ease-out
            ${
              isMobileMenuOpen
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Bouton de fermeture dans le menu */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Section utilisateur en haut avec cercle coloré - Version améliorée */}
            {isAuthenticated && user ? (
              <div
                className={`
                  relative pt-10 pb-6 px-4
                  border-b border-white/20
                  transition-all duration-500 ease-out
                  ${
                    isMobileMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-8 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: isMobileMenuOpen ? "100ms" : "0ms",
                }}
              >
                {/* Badge de statut */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1.5 bg-(--accent)/15 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-(--accent) rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-(--accent) font-medium"></span>
                  </div>
                </div>

                {/* Cercle coloré avec effet de brillance */}
                <div className="relative flex justify-center">
                  <div className="absolute inset-0 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-linear-to-r from-rose-500 to-purple-600 blur-xl"></div>
                  </div>
                  <div className="relative w-20 h-20 rounded-full bg-linear-to-r from-rose-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg ring-4 ring-white/20">
                    {user.image ? (
                      <ProductImage
                        src={user.image}
                        alt={user.name || "User"}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                </div>

                {/* Informations utilisateur avec décorations */}
                <div className="text-center mt-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="h-px w-6 bg-linear-to-r from-transparent to-white/30"></div>
                    <h3 className="text-white font-bold text-base">
                      {user.name || "Utilisateur"}
                    </h3>
                    <div className="h-px w-6 bg-linear-to-l from-transparent to-white/30"></div>
                  </div>

                  {/* Email avec icône */}
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <svg
                      className="w-3 h-3 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-white/50 text-xs">{user.email}</p>
                  </div>

                  {/* Statistiques rapides */}
                  <div className="flex items-center justify-center gap-4 mt-3 pt-2">
                    <div className="text-center">
                      <p className="text-white font-bold text-sm">128</p>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">
                        Points
                      </p>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="text-center">
                      <p className="text-white font-bold text-sm">12</p>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">
                        Cours
                      </p>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="text-center">
                      <p className="text-white font-bold text-sm">5</p>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">
                        Projets
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`
                  pt-10 pb-6 px-4
                  border-b border-white/20
                  transition-all duration-500 ease-out
                  ${
                    isMobileMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-8 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: isMobileMenuOpen ? "100ms" : "0ms",
                }}
              >
                <div className="relative flex justify-center">
                  <div className="absolute inset-0 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-linear-to-r from-rose-500/20 to-purple-600/20 blur-xl"></div>
                  </div>
                  <div className="relative w-20 h-20 rounded-full bg-linear-to-r from-rose-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white/20">
                    <User className="w-10 h-10" />
                  </div>
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-white font-bold text-base">Invité</h3>
                  <p className="text-white/40 text-xs mt-1">
                    Connectez-vous pour accéder
                    <br />à votre compte
                  </p>
                </div>
              </div>
            )}

            {/* Liens de navigation mobiles */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="list-none space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.url}
                      onClick={() => {
                        setActive(link.name);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap inline-block w-full ${
                        active === link.name
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div
                className={`
                  h-px bg-white/20 my-3 transition-all duration-500
                  ${
                    isMobileMenuOpen
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: isMobileMenuOpen ? "400ms" : "0ms",
                }}
              />

              {/* Actions mobiles */}
              <button
                className={`
                  flex items-center gap-2 w-full px-4 py-3 rounded-lg 
                  text-white/90 hover:bg-white/10 transition-all duration-300 ease-out
                  ${
                    isMobileMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-8 opacity-0"
                  }
                `}
                style={{
                  transitionDelay: isMobileMenuOpen ? "460ms" : "0ms",
                }}
              >
                <Globe className="w-4 h-4" />
                <span className="text-base font-medium">English (EN)</span>
              </button>

              {/* Liens pour utilisateur non connecté */}
              {!isAuthenticated && (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      w-full block px-4 py-3 rounded-lg text-white/90 bg-white/10
                      transition-all duration-300 ease-out text-center text-base font-medium
                      ${
                        isMobileMenuOpen
                          ? "translate-x-0 opacity-100"
                          : "translate-x-8 opacity-0"
                      }
                    `}
                    style={{
                      transitionDelay: isMobileMenuOpen ? "520ms" : "0ms",
                    }}
                  >
                    Log In
                  </Link>

                  <Link
                    href="/login?mode=register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      w-full block px-4 py-3 mt-2 text-center text-white 
                      bg-linear-to-r from-rose-500 to-purple-600 backdrop-blur-sm 
                      transition-all duration-300 ease-out text-base font-semibold 
                      rounded-xl border border-white/30
                      ${
                        isMobileMenuOpen
                          ? "translate-x-0 opacity-100"
                          : "translate-x-8 opacity-0"
                      }
                    `}
                    style={{
                      transitionDelay: isMobileMenuOpen ? "580ms" : "0ms",
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Liens pour utilisateur connecté en bas */}
            {isAuthenticated && user && (
              <div className="border-t border-white/20 pt-3 pb-6 px-4">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 hover:bg-white/10 
                    transition-all duration-300 ease-out text-left text-sm font-medium group
                    ${
                      isMobileMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: isMobileMenuOpen ? "640ms" : "0ms",
                  }}
                >
                  <User className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  <span>Mon Profil</span>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 hover:bg-white/10 
                    transition-all duration-300 ease-out text-left text-sm font-medium group
                    ${
                      isMobileMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: isMobileMenuOpen ? "700ms" : "0ms",
                  }}
                >
                  <LayoutDashboard className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  <span>Tableau de bord</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/90 hover:bg-white/10 
                    transition-all duration-300 ease-out text-left text-sm font-medium group
                    ${
                      isMobileMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: isMobileMenuOpen ? "760ms" : "0ms",
                  }}
                >
                  <Settings className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  <span>Paramètres</span>
                </Link>

                <div className="h-px bg-white/10 my-2"></div>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-300 bg-white/10 
                    transition-all duration-300 ease-out text-left text-sm font-medium group
                    ${
                      isMobileMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-8 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay: isMobileMenuOpen ? "820ms" : "0ms",
                  }}
                >
                  <LogOut className="w-4 h-4 text-red-300/70 group-hover:text-red-300 transition-colors" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
