// app/auth/google-callback/page.tsx
"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

function persistAuthTokens(accessToken?: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  try {
    if (accessToken) window.localStorage.setItem("accessToken", accessToken);
    if (refreshToken) window.localStorage.setItem("refreshToken", refreshToken);
  } catch (err) {
    // ignore
    // eslint-disable-next-line no-console
    console.error("persistAuthTokens error:", err);
  }
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (!accessToken) {
        toast.error("Erreur lors de l'authentification Google");
        router.push("/login");
        return;
      }

      try {
        persistAuthTokens(accessToken, refreshToken ?? undefined);

        const result = await signIn("google", {
          redirect: false,
        });

        if (result?.error) {
          toast.error("Erreur lors de la connexion Google");
          router.push("/login");
          return;
        }

        toast.success("Connexion avec Google réussie !");
        // Rediriger selon le rôle
        const session = await getSession();
        const role = session?.user?.role;
        if (role === "ADMIN" || role === "GESTIONNAIRE") {
          router.push("/admin/dashboard");
        } else {
          router.push("/post");
        }
      } catch (error) {
        console.error("Erreur callback Google:", error);
        router.push("/login");
      }
    };

    handleGoogleCallback();
  }, [accessToken, refreshToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  );
}
