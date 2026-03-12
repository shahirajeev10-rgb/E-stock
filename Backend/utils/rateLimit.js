const buckets = new Map();

function defaultKey(req) {
  return (
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  keyGenerator = defaultKey,
  message = "Too many requests. Please try again later.",
} = {}) {
  return function rateLimitMiddleware(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    existing.count += 1;

    if (existing.count > max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000)
      );
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        ok: false,
        message,
      });
    }

    return next();
  };
}

module.exports = {
  createRateLimiter,
};
