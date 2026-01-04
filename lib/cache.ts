/**
 * Simple in-memory cache with TTL support for API response caching.
 * Reduces database load and improves response times.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with TTL in seconds
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries matching a prefix
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats for monitoring
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  BASEL_STANDARDS: 5 * 60, // 5 minutes
  PODCAST_CATEGORIES: 5 * 60, // 5 minutes
  PODCASTS: 2 * 60, // 2 minutes
  NOTIFICATIONS: 30, // 30 seconds
} as const;

// Cache key prefixes
export const CACHE_KEYS = {
  BASEL_STANDARDS: "basel:standards",
  BASEL_CHAPTERS: "basel:chapters",
  PODCAST_CATEGORIES: "angle:categories",
  PODCASTS: "angle:podcasts",
} as const;
