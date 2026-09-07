# Guide d'intégration Sentry

Ce guide explique comment configurer et utiliser Sentry pour la capture d'erreurs et le monitoring en production.

## Configuration initiale

### 1. Créer un compte Sentry

1. Aller sur [sentry.io](https://sentry.io)
2. Créer un nouveau projet pour "Next.js"
3. Copier le DSN fourni

### 2. Ajouter le DSN aux variables d'environnement

Ajouter au fichier `.env.local` (ne pas commiter) :

```bash
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

Ajouter au fichier `.env.example` (pour la documentation) :

```bash
NEXT_PUBLIC_SENTRY_DSN=""
```

### 3. Initialiser Sentry dans le layout racine

**app/layout.tsx**

```tsx
"use client";

import { initializeSentryClient } from "@/lib/sentry/client-utils";
import { ReactNode } from "react";

// Initialiser Sentry une seule fois au chargement du client
if (typeof window !== "undefined") {
  initializeSentryClient();
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 4. Initialiser Sentry côté serveur

**middleware.ts ou au démarrage du serveur**

```ts
import { initializeSentryServer } from "@/lib/sentry/server-utils";

initializeSentryServer();
```

## Utilisation basique

### Capturer les erreurs automatiquement

Sentry capture automatiquement :
- Les erreurs non gérées (try/catch)
- Les rejets de promesses
- Les erreurs d'API
- Les erreurs 4xx et 5xx

### Capturer les erreurs manuellement

**Côté client**

```tsx
"use client";
import { captureException } from "@/lib/sentry/client-utils";

export default function MyComponent() {
  const handleClick = async () => {
    try {
      // Votre code
    } catch (error) {
      captureException(error as Error, {
        action: "handleClick",
        component: "MyComponent",
      });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

**Côté serveur**

```ts
import { captureServerException } from "@/lib/sentry/server-utils";

export async function POST(request: Request) {
  try {
    // Votre code API
  } catch (error) {
    captureServerException(error as Error, {
      route: "/api/posts",
      method: "POST",
    });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Ajouter du contexte

```tsx
import { setUserContext, addBreadcrumb } from "@/lib/sentry/client-utils";

// Définir l'utilisateur
setUserContext({
  id: user.id,
  email: user.email,
  username: user.username,
});

// Ajouter des pistes (breadcrumbs)
addBreadcrumb("User clicked button", {
  buttonId: "submit-btn",
  page: "checkout",
});
```

### Capturer les messages

```tsx
import { captureMessage } from "@/lib/sentry/client-utils";

// Capturer un événement important
captureMessage("User completed purchase", "info");

// Capturer un avertissement
captureMessage("API request took too long", "warning");

// Capturer une erreur
captureMessage("Database connection failed", "error");
```

## Patterns avancés

### Wrapper pour les API routes

```ts
// api/posts/route.ts
import { withSentryErrorHandler } from "@/lib/sentry/server-utils";

async function handler(request: Request) {
  // Votre logique API
}

export const POST = withSentryErrorHandler(handler);
```

### Wrapper pour les opérations base de données

```ts
import { withSentryError } from "@/lib/sentry/server-utils";
import { db } from "@/lib/prisma";

export async function createPost(data: PostData) {
  return await withSentryError(
    async () => {
      return await db.post.create({ data });
    },
    {
      operation: "createPost",
      data: { title: data.title },
    },
  );
}
```

### Gestion d'erreurs dans les composants

```tsx
"use client";
import { useCallback } from "react";
import { captureException } from "@/lib/sentry/client-utils";

export default function UserForm() {
  const handleSubmit = useCallback(
    async (formData: FormData) => {
      try {
        const response = await fetch("/api/users", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (error) {
        captureException(error as Error, {
          form: "UserForm",
          action: "handleSubmit",
        });
        // Afficher un message d'erreur à l'utilisateur
        toast.error("Une erreur est survenue");
      }
    },
    [],
  );

  return (
    <form onSubmit={(e) => handleSubmit(new FormData(e.currentTarget))}>
      {/* Votre formulaire */}
    </form>
  );
}
```

## Vue d'ensemble dans Sentry

Vous verrez dans Sentry :

1. **Issues** : Liste des erreurs groupées
2. **Trends** : Tendances des erreurs dans le temps
3. **Releases** : Erreurs par version
4. **Performance** : Métriques de performance (si activé)
5. **Replays** : Enregistrement vidéo des sessions avec erreur

## Configuration avancée

### Masquer les données sensibles

La configuration Sentry masque automatiquement :
- Les mots-clé "credit card"
- Les mots-clé "password"
- Les données personnelles

### Filtrer les erreurs

Pour ignorer certaines erreurs :

```ts
// lib/sentry/config.ts
ignoreErrors: [
  // Ajouter les patterns à ignorer
  "Network request failed",
  "User cancelled",
],
```

### Échantillonnage

Pour économiser les quota Sentry :

```ts
// Production : 10% des traces
tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

// Production : capturer 100% des erreurs
replaysOnErrorSampleRate: 1.0,
```

## Troubleshooting

### Les erreurs ne sont pas capturées

1. Vérifier que le DSN est configuré : `process.env.NEXT_PUBLIC_SENTRY_DSN`
2. Vérifier que Sentry est initialisé : `initializeSentryClient()` ou `initializeSentryServer()`
3. Vérifier les logs du navigateur (F12 > Console)

### Les données sensibles s'affichent

Mettre à jour `beforeSend` dans `SENTRY_CLIENT_CONFIG`

### Trop d'erreurs capturées

Augmenter le filtrage dans `ignoreErrors` et `denyUrls`

## Ressources

- [Documentation Sentry](https://docs.sentry.io/)
- [Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Configuration Options](https://docs.sentry.io/platforms/javascript/configuration/options/)
