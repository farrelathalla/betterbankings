/**
 * Input validation and sanitization utilities.
 * Prevents XSS, SQL injection (via Prisma), and ensures data integrity.
 */

// Maximum allowed string lengths
export const MAX_LENGTHS = {
  NAME: 100,
  EMAIL: 255,
  PHONE: 20,
  TITLE: 200,
  DESCRIPTION: 5000,
  URL: 2048,
  CODE: 10,
  SEARCH: 100,
} as const;

/**
 * Sanitize string by removing potentially dangerous characters
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  if (typeof input !== "string") return "";

  return input.trim().slice(0, maxLength).replace(/[<>]/g, ""); // Remove < and > to prevent basic XSS
}

/**
 * Sanitize HTML by encoding special characters
 */
export function escapeHtml(input: string): string {
  if (typeof input !== "string") return "";

  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= MAX_LENGTHS.EMAIL;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      url.length <= MAX_LENGTHS.URL
    );
  } catch {
    return false;
  }
}

/**
 * Validate phone number (basic format check)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s()-]{6,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize and validate pagination parameters
 */
export function sanitizePagination(
  page?: string | null,
  limit?: string | null
): { page: number; limit: number; skip: number } {
  const parsedPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const parsedLimit = Math.min(
    100,
    Math.max(1, parseInt(limit || "20", 10) || 20)
  );

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
}

/**
 * Validate required fields are present and non-empty
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const field of fields) {
    const value = data[field];
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Rate limit check result type
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// In-memory rate limit store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for an IP/key
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + windowSeconds * 1000;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute
