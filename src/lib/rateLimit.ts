interface RateLimitInfo {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitInfo>();

// Run a periodic cleanup task to remove stale IP tracking blocks and prevent memory leaks.
// Checking globalThis prevents multiple intervals in hot-reloading dev environments.
if (typeof globalThis !== 'undefined') {
  const global = globalThis as any;
  if (!global.rateLimitCleanupInterval) {
    global.rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of rateLimitMap.entries()) {
        const activeTimestamps = value.timestamps.filter((t) => now - t < 60 * 1000);
        if (activeTimestamps.length === 0) {
          rateLimitMap.delete(key);
        } else {
          value.timestamps = activeTimestamps;
        }
      }
    }, 10000);
  }
}

/**
 * Checks if the request from the given IP is within rate limits.
 * 
 * @param ip Client IP Address
 * @param limit Max allowed requests within window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(ip: string, limit = 60, windowMs = 60 * 1000) {
  const now = Date.now();
  let info = rateLimitMap.get(ip);
  if (!info) {
    info = { timestamps: [] };
    rateLimitMap.set(ip, info);
  }

  // Filter timestamps to keep only those within the current window
  info.timestamps = info.timestamps.filter((t) => now - t < windowMs);

  if (info.timestamps.length >= limit) {
    const oldest = info.timestamps[0];
    const resetTime = oldest + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime,
    };
  }

  info.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - info.timestamps.length,
    resetTime: now + windowMs,
  };
}
