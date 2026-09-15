import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T = unknown> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((result: unknown): ResponseFormat<T> => {
        if (
          result !== null &&
          typeof result === 'object' &&
          'data' in result &&
          'meta' in result
        ) {
          const res = result as { data: T; meta?: Record<string, unknown> };
          return {
            success: true,
            data: res.data,
            meta: res.meta,
          };
        }

        if (
          result !== null &&
          typeof result === 'object' &&
          'data' in result &&
          !('meta' in result)
        ) {
          const res = result as { data: T };
          return {
            success: true,
            data: res.data,
          };
        }

        return {
          success: true,
          data: (result ?? {}) as T,
        };
      }),
    );
  }
}
