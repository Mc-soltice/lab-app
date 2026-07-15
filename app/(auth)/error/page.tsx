// app/auth/error/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    AccessDenied:
      "Accès refusé. Vérifiez que votre compte Google est autorisé.",
    OAuthSignin: "Erreur lors de la connexion OAuth.",
    OAuthCallback: "Erreur lors du callback OAuth.",
    OAuthCreateAccount: "Erreur lors de la création du compte.",
    EmailCreateAccount: "Erreur lors de la création du compte email.",
    Callback: "Erreur lors du callback.",
    OAuthAccountNotLinked: "Ce compte Google est déjà lié à un autre compte.",
    EmailSignin: "Erreur lors de l&apos;envoi de l&apos;email.",
    CredentialsSignin: "Identifiants invalides.",
    SessionRequired: "Session requise.",
    Default: "Une erreur inattendue s&apos;est produite.",
  };

  const message = error
    ? errorMessages[error] || errorMessages.Default
    : "Erreur inconnue";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Erreur d&apos;authentification
          </h2>
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">{message}</p>
            {error && (
              <p className="text-xs text-red-600 mt-2">
                Code d&apos;erreur: {error}
              </p>
            )}
          </div>
          <Link
            href="/login"
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
