import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const ip in store) {
    if (store[ip].resetTime < now) {
      delete store[ip];
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max requests per window
  message?: string;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000; // Default: 60 seconds
  const max = options.max || 60; // Default: 60 requests
  const message = options.message || "Too many requests, please try again later.";

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    if (!store[ip] || store[ip].resetTime < now) {
      // Initialize or reset
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[ip].count++;

    if (store[ip].count > max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((store[ip].resetTime - now) / 1000),
      });
    }

    next();
  };
}
