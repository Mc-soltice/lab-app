// lib/sentry/server.ts
/**
 * Initialisation Sentry côté serveur
 */

import * as Sentry from "@sentry/nextjs";
import { SENTRY_SERVER_CONFIG } from "./config";

/**
 * Initialise Sentry côté serveur
 * À appeler une seule fois au démarrage
 */
export function initializeSentryServer() {
  if (!SENTRY_SERVER_CONFIG.dsn) {
    console.warn("Sentry DSN not configured, error tracking disabled");
    return;
  }

  Sentry.init(SENTRY_SERVER_CONFIG);
}

/**
 * Capture une exception côté serveur
 */
export function captureServerException(error: Error, context?: Record<string, any>) {
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
 * Capture un message côté serveur
 */
export function captureServerMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
) {
  Sentry.captureMessage(message, level);
}

/**
 * Ajoute une breadcrumb côté serveur
 */
export function addServerBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: "info",
  });
}

/**
 * Wrapper pour les API routes avec gestion d'erreurs Sentry
 */
export function withSentryErrorHandler(handler: (req: any, res: any) => Promise<void>) {
  return Sentry.wrapApiHandlerWithSentry(handler, "api");
}

/**
 * Wrapper pour les mutations Prisma avec gestion d'erreurs Sentry
 */
export async function withSentryError<T>(
  fn: () => Promise<T>,
  context?: { operation: string; data?: any },
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (context) {
      Sentry.withScope((scope) => {
        scope.setContext("operation", {
          name: context.operation,
          data: context.data,
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
    throw error;
  }
}
