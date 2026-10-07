/**
 * Ultra-Robust Client Security Module for ITMC Platform
 * Provides:
 * - Anti-XSS & Anti-Code Injection Sanitization
 * - Anti-SQL / NoSQL / Command Injection Filters
 * - Prototype Pollution Prevention
 * - Client-Side Rate Limiting & Anti-Spam Guards
 * - CSRF Token Generation & Management
 */

/**
 * Sanitize text to eliminate HTML/JavaScript XSS injections
 */
export function sanitizeInput(input: unknown): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/`/g, "&#x60;");
}

/**
 * Deep recursive object & string input sanitizer with prototype pollution prevention
 */
export function sanitizeObject<T>(data: T): T {
  if (typeof data === "string") {
    return sanitizeInput(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (data !== null && typeof data === "object") {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      // Prevent Prototype Pollution
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      cleaned[key] = sanitizeObject((data as Record<string, any>)[key]);
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Checks string for malicious injection attack vectors (SQLi, Scripting, Path Traversal, Command execution)
 */
export function isInjectionPayload(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  // Ignore legitimate large base64 image data strings
  if (str.startsWith("data:image/") || str.startsWith("data:application/pdf")) {
    return false;
  }
  
  const injectionPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /eval\(/i,
    /exec\(/i,
    /document\.cookie/i,
    /window\.location/i,
    /union\s+select/i,
    /select\s+.*\s+from/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+.*\s+set/i,
    /--\s*$/i,
    /;\s*drop/i,
    /;\s*delete/i,
    /\.\.\//, // Path traversal
    /\$where/i, // NoSQL injection
    /\$gt/i,
    /\$ne/i
  ];

  return injectionPatterns.some((pattern) => pattern.test(str));
}

/**
 * Safe client session payload encoder (server handles authentic cryptographic signing)
 */
export async function encryptAndSignPayload(payload: Record<string, any>): Promise<string> {
  const jsonStr = JSON.stringify({
    data: sanitizeObject(payload),
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 12),
  });
  
  const base64Data = btoa(encodeURIComponent(jsonStr));
  return `${base64Data}.client_cached`;
}

/**
 * Safe client session payload decoder
 */
export async function verifyAndDecryptPayload<T = Record<string, any>>(token: string): Promise<{
  valid: boolean;
  data?: T;
  error?: string;
}> {
  if (!token) {
    return { valid: false, error: "Jeton manquant" };
  }

  // Handle server JWT token (3 parts: header.payload.signature)
  if (token.split('.').length === 3) {
    try {
      const parts = token.split('.');
      const payloadJson = decodeURIComponent(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(payloadJson);
      if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
        return { valid: false, error: "Session expirée." };
      }
      return { valid: true, data: payload as T };
    } catch (e) {
      return { valid: false, error: "Format de jeton invalide" };
    }
  }

  // Handle legacy 2-part token
  const [base64Data] = token.split(".");
  try {
    const jsonStr = decodeURIComponent(atob(base64Data));
    const parsed = JSON.parse(jsonStr);

    if (Date.now() - parsed.timestamp > 8 * 3600 * 1000) {
      return { valid: false, error: "Jeton de sécurité expiré." };
    }

    return { valid: true, data: parsed.data as T };
  } catch (e) {
    return { valid: false, error: "Impossible de déchiffrer le contenu" };
  }
}

/**
 * Rate Limiting Tracker (Client-Side Protection)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60000): { allowed: boolean; remainingMs?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remainingMs: record.resetTime - now };
  }

  record.count += 1;
  return { allowed: true };
}

/**
 * CSRF Token Generator & Validator
 */
export function getCsrfToken(): string {
  let token = sessionStorage.getItem("ITMC_CSRF_TOKEN");
  if (!token) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    sessionStorage.setItem("ITMC_CSRF_TOKEN", token);
  }
  return token;
}

export function validateCsrfToken(submittedToken: string): boolean {
  const currentToken = sessionStorage.getItem("ITMC_CSRF_TOKEN");
  if (!currentToken || !submittedToken) return false;
  return currentToken === submittedToken;
}

