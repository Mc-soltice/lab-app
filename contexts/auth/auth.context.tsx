"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { RegisterSchema } from "../../lib/validation/schemas";

type CreateUserPayload = z.infer<typeof RegisterSchema>;

type AuthContextValue = {
  register: (data: CreateUserPayload) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function registerUser(data: CreateUserPayload) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'inscription");
  }

  return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user ?? null;

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          toast.error(res.error);
          throw new Error(res.error);
        }

        toast.success("Connexion réussie");
        router.push("/home");
        router.refresh();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (data: CreateUserPayload) => {
      setIsLoading(true);
      try {
        await registerUser(data);
        toast.success("Compte créé avec succès");
        await login(data.email, data.password);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erreur lors de l'inscription",
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ register, login, logout, isLoading, isAuthenticated, user }),
    [register, login, logout, isLoading, isAuthenticated, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
