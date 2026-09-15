import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    mockContext = {} as ExecutionContext;
  });

  it('should wrap scalar and object data in standard success format', (done) => {
    const handler: CallHandler = {
      handle: () => of({ id: 'member_1', name: 'John Doe' }),
    };

    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: { id: 'member_1', name: 'John Doe' },
      });
      done();
    });
  });

  it('should preserve collection data and meta when provided', (done) => {
    const handler: CallHandler = {
      handle: () =>
        of({
          data: [{ id: 1 }, { id: 2 }],
          meta: { total: 2, page: 1, limit: 10 },
        }),
    };

    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
        meta: { total: 2, page: 1, limit: 10 },
      });
      done();
    });
  });

  it('should wrap array data in data field', (done) => {
    const handler: CallHandler = {
      handle: () => of([1, 2, 3]),
    };

    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: [1, 2, 3],
      });
      done();
    });
  });
});
