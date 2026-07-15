"use client";

import { usePathname } from "next/navigation";

export function useActiveRoute() {
  const pathname = usePathname();

  /**
   * Vérifie si une route correspond
   * Plus robuste pour gérer les sous-routes
   */
  const isActiveRoute = (href: string) => {
    // Cas particulier : la home "/" ne doit pas matcher toutes les routes
    if (href === "/") {
      return pathname === "/";
    }

    // Cas exact : on est sur la route exacte
    if (pathname === href) {
      return true;
    }

    // Cas des sous-routes : on vérifie que c'est un préfixe avec un slash
    // Exemple : "/dashboard" matche "/dashboard/users" mais pas "/dashboard-other"
    return pathname.startsWith(`${href}/`);
  };

  return {
    pathname,
    isActiveRoute,
  };
}
