import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const HTTP_STATUS_TO_ERROR_CODE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected internal error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorCode = HTTP_STATUS_TO_ERROR_CODE[status] || `HTTP_${status}`;

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;

        if (Array.isArray(resObj.message)) {
          errorMessage = resObj.message.join('; ');
        } else if (typeof resObj.message === 'string') {
          errorMessage = resObj.message;
        } else if (typeof resObj.error === 'string') {
          errorMessage = resObj.error;
        }

        if (typeof resObj.code === 'string') {
          errorCode = resObj.code;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception [${request.method} ${request.url}]: ${exception.message}`,
        exception.stack,
      );
      if (process.env.NODE_ENV !== 'production') {
        errorMessage = exception.message;
      }
    } else {
      this.logger.error(
        `Non-error exception caught: ${JSON.stringify(exception)}`,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });
  }
}
