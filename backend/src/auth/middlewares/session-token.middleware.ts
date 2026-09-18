import type { Request, Response, NextFunction } from 'express';
import * as cookieSignature from 'cookie-signature';

/**
 * Middleware to support Authorization: Bearer <sessionId> or x-session-id headers
 * as a robust fallback for browsers that block cross-site cookies (e.g., Apple WebKit ITP on iOS).
 */
export function sessionTokenMiddleware(sessionSecret: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'] || req.headers['x-session-id'];
    if (authHeader && (!req.headers.cookie || !req.headers.cookie.includes('uijudo.sid='))) {
      const rawToken =
        typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7).trim()
          : String(authHeader).trim();

      if (rawToken) {
        const signed = 's:' + cookieSignature.sign(rawToken, sessionSecret);
        req.headers.cookie = req.headers.cookie
          ? `${req.headers.cookie}; uijudo.sid=${encodeURIComponent(signed)}`
          : `uijudo.sid=${encodeURIComponent(signed)}`;
      }
    }
    next();
  };
}
