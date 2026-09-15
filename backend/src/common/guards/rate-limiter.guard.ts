import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly ipRequests = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 60 * 1000, maxRequests = 120) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  canActivate(context: ExecutionContext): boolean {
    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const now = Date.now();
    const cutoff = now - this.windowMs;

    let record = this.ipRequests.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.ipRequests.set(ip, record);
    }

    // Retain only requests within current window
    record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

    if (record.timestamps.length >= this.maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down and try again later.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.timestamps.push(now);

    // Opportunistic memory cleanup
    if (this.ipRequests.size > 5000) {
      for (const [key, val] of this.ipRequests.entries()) {
        if (
          val.timestamps.length === 0 ||
          val.timestamps[val.timestamps.length - 1] <= cutoff
        ) {
          this.ipRequests.delete(key);
        }
      }
    }

    return true;
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }
}
