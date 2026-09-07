// lib/sentry/config.ts
/**
 * Configuration Sentry pour la capture d'erreurs côté serveur et client
 */

export const SENTRY_CONFIG = {
  // DSN à configurer dans les variables d'environnement
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Taux d'échantillonnage pour les traces (0-1)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Taux d'échantillonnage des profiles
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Options de transport pour Next.js
  transportOptions: {
    headers: {
      "User-Agent": "lab-app",
    },
  },

  // Inclure le contexte local dans les erreurs
  attachStacktrace: true,

  // Ignorer les erreurs spécifiques
  ignoreErrors: [
    // Ignorer les erreurs de navigateur qui ne nous concernent pas
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // Erreurs réseau couantes
    "NetworkError",
    "timeout",
  ],

  // Denylister les URLs qui ne doivent pas être capturées
  denyUrls: [
    // Extensions Chrome
    /^chrome:\/\//i,
    // Erreurs de hotspot Wi-Fi de certains routeurs
    /graph\.facebook\.com/i,
    // Erreurs d'extensions Firefox
    /moz-extension:\/\//i,
  ],

  // Options de traçage pour les performances
  integrations: [
    // Intégration automatique des erreurs HTTP
    // Intégration automatique des erreurs d'API
    // À configurer lors de l'initialisation
  ],
};

/**
 * Options supplémentaires pour le client
 */
export const SENTRY_CLIENT_CONFIG = {
  ...SENTRY_CONFIG,
  // Capture les erreurs non gérées dans les promesses
  attachStacktrace: true,

  // BeforeSend pour filtrer les événements
  beforeSend: (event: any) => {
    // Filtrer les erreurs privées
    if (event.exception) {
      const error = event.exception.values[0];
      if (
        error.value?.includes("credit card") ||
        error.value?.includes("password")
      ) {
        return null; // Ne pas envoyer les erreurs sensibles
      }
    }
    return event;
  },
};

/**
 * Options supplémentaires pour le serveur
 */
export const SENTRY_SERVER_CONFIG = {
  ...SENTRY_CONFIG,
  // Capture les erreurs non gérées côté serveur
  captureUnhandledExceptions: true,
  captureUnhandledRejections: true,

  // Timeout pour l'envoi des événements
  maxBreadcrumbs: 100,
};
