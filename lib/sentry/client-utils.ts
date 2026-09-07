// lib/sentry/client.ts
/**
 * Initialisation Sentry côté client
 */

import * as Sentry from "@sentry/nextjs";
import { SENTRY_CLIENT_CONFIG } from "./config";

/**
 * Initialise Sentry côté client
 * À appeler depuis le layout racine
 */
export function initializeSentryClient() {
  if (!SENTRY_CLIENT_CONFIG.dsn) {
    console.warn("Sentry DSN not configured, error tracking disabled");
    return;
  }

  Sentry.init({
    ...SENTRY_CLIENT_CONFIG,
  });
}

/**
 * Capture une exception manuellement
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture un message
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
) {
  Sentry.captureMessage(message, level);
}

/**
 * Ajoute une breadcrumb (piste de navigation)
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: "info",
  });
}

/**
 * Définit le contexte utilisateur
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Efface le contexte utilisateur
 */
export function clearUserContext() {
  Sentry.setUser(null);
}
