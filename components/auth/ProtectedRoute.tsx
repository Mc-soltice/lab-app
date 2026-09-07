"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({
  children,
  fallback = null,
  allowedRoles,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  allowedRoles?: Array<string>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }

    if (
      status !== "loading" &&
      status !== "unauthenticated" &&
      allowedRoles &&
      session?.user?.role &&
      !allowedRoles.includes(String(session.user.role))
    ) {
      router.replace("/post");
    }
  }, [allowedRoles, router, session?.user?.role, status]);

  if (status === "loading") {
    return <>{fallback}</>;
  }

  if (!session) {
    return <>{fallback}</>;
  }

  if (
    allowedRoles &&
    session?.user?.role &&
    !allowedRoles.includes(String(session.user.role))
  ) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
