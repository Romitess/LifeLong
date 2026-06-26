import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp: string;
  path: string;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isDevelopment: boolean;

  constructor(configService: ConfigService) {
    this.isDevelopment = configService.getOrThrow<string>('NODE_ENV') === 'development';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const err = exception instanceof Error ? exception : new Error(String(exception));

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();

      const base: ErrorResponseBody =
        typeof raw === 'string'
          ? { statusCode: status, message: raw, timestamp: '', path: '' }
          : (raw as ErrorResponseBody);

      const body: ErrorResponseBody = {
        ...base,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      this.logger.warn(`${request.method} ${request.url} → ${status}: ${err.message}`);
      response.status(status).json(body);
      return;
    }

    // Unknown / unhandled errors — hide internals from client
    this.logger.error(`${request.method} ${request.url} → 500: ${err.message}`, err.stack);

    const body: ErrorResponseBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (this.isDevelopment && err.stack) {
      body.stack = err.stack;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
