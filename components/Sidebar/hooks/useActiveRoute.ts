"use client";

import { usePathname } from "next/navigation";

interface RouteCandidate {
  href: string;
}

export function useActiveRoute() {
  const pathname = usePathname();

  /**
   * Détermine UN SEUL lien actif en retournant le href le plus spécifique :
   * 1. correspondance exacte prioritaire
   * 2. sinon, le préfixe le plus long gagne
   *
   * Exemple sur "/dashboard/podcasts" :
   * "/dashboard/podcasts" (enfant Podcasts) gagne sur "/dashboard" (Dashboard
   * et groupe Administration) => un seul onglet actif.
   */
  const findActiveRoute = (items: RouteCandidate[]): string | null => {
    // 1. Correspondance exacte
    const exact = items.find((item) => item.href === pathname);
    if (exact) {
      return exact.href;
    }

    // 2. Préfixes : l'URL la plus longue l'emporte
    const prefixes = items
      .filter((item) => item.href !== "/" && pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length);

    return prefixes.length > 0 ? prefixes[0].href : null;
  };

  return {
    pathname,
    findActiveRoute,
  };
}
