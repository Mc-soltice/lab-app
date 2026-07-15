import type { LucideIcon } from "lucide-react";

export type UserRole = "ADMIN" | "BLOGGER";

export interface SidebarItemType {
  label: string;

  /**
   * Route de navigation
   */
  href: string;

  /**
   * Icône Lucide
   */
  icon?: LucideIcon;

  /**
   * Rôles autorisés à voir cet élément
   *
   * Si absent => visible par tout le monde
   */
  roles?: UserRole[];

  /**
   * Badge dynamique
   *
   * Exemple:
   * 5
   * "NEW"
   * "99+"
   */
  badge?: string | number;

  /**
   * Sous-navigation
   */
  children?: SidebarItemType[];
}
