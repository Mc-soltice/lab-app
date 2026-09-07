// lib/auth/permissions.ts
// Rôles autorisés à voir la section Administration
export const ADMIN_ROLES = ["ADMIN", "GESTIONNAIRE"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

/**
 * Vérifie si un utilisateur a accès à la section Administration.
 * Seuls les rôles ADMIN et GESTIONNAIRE sont autorisés.
 */
export function canAccessAdmin(role?: string | null): boolean {
  if (!role) return false;
  return (ADMIN_ROLES as readonly string[]).includes(role);
}
