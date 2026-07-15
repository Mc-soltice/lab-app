// lib/rate-limit.ts

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();

  async check(
    key: string,
    type: "login" | "register" | "api" = "api",
  ): Promise<void> {
    const configs: Record<string, RateLimitConfig> = {
      login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 tentatives / 15 min
      register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 tentatives / 1 heure
      api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requêtes / minute
    };

    const config = configs[type] || configs.api;
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return;
    }

    if (record.count >= config.maxRequests) {
      const waitTime = Math.ceil((record.resetTime - now) / 1000);
      throw new Error(
        `Trop de tentatives. Veuillez réessayer dans ${waitTime} secondes.`,
      );
    }

    record.count++;
    this.requests.set(key, record);
  }

  // Nettoyer les entrées expirées périodiquement
  clean(): void {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Singleton
export const rateLimit = new RateLimiter();

// Nettoyer toutes les 5 minutes
setInterval(
  () => {
    rateLimit.clean();
  },
  5 * 60 * 1000,
);
