import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { JwtPayload } from 'src/modules/auth/jwt-auth.guard';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const start = Date.now();
    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const { method, url } = req;
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.socket?.remoteAddress ??
      null;

    const log = (statusCode: number): void => {
      this.logger.log(
        JSON.stringify({
          method,
          url,
          userId: req.user?.sub ?? null,
          role: req.user?.role ?? null,
          ip,
          statusCode,
          durationMs: Date.now() - start,
          timestamp: new Date().toISOString(),
        }),
      );
    };

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          log(res.statusCode);
        },
        error: (err: unknown) => {
          const statusCode =
            err instanceof HttpException
              ? err.getStatus()
              : ((err as { status?: number }).status ?? 500);
          log(statusCode);
        },
      }),
    );
  }
}
