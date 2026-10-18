import type { Request, Response, NextFunction } from 'express';
import { getMemoryStore, isInMemoryMode, pool } from '../db';

interface CacheEntry {
  statusCode: number;
  body: any;
  headers: Record<string, string>;
  createdAt: number;
}

const memoryIdempotencyCache = new Map<string, CacheEntry>();

export function idempotencyMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only apply to mutating requests with an Idempotency-Key
    const key = req.headers['idempotency-key'] as string;
    if (!key || req.method === 'GET' || req.method === 'HEAD') {
      return next();
    }

    const userId = req.user?.id || 'anonymous';
    const cacheKey = `${userId}:${key}`;

    // 1. Check in-memory cache
    const cached = memoryIdempotencyCache.get(cacheKey);
    if (cached) {
      const isExpired = Date.now() - cached.createdAt > 120_000; // 2 minute window
      if (!isExpired) {
        res.setHeader('X-Cache-Lookup', 'HIT');
        res.setHeader('X-Idempotent-Deduplicated', 'true');
        return res.status(cached.statusCode).json(cached.body);
      }
      memoryIdempotencyCache.delete(cacheKey);
    }

    // 2. Intercept response to store result
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Store in memory cache
      memoryIdempotencyCache.set(cacheKey, {
        statusCode: res.statusCode,
        body,
        headers: {},
        createdAt: Date.now(),
      });
      return originalJson(body);
    };

    next();
  };
}
