"use client";

import { useSession } from "next-auth/react";

export function useUserRole() {
  const { data: session } = useSession();

  // Adaptez selon votre structure de session
  // Si votre rôle est stocké différemment, modifiez cette ligne
  return session?.user?.role ?? "BLOGGER";
}
