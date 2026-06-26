import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import type { ServerResponse } from 'node:http';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ALLOWED_ORIGINS } from './config/allowed-origins';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ALLOWED_ORIGINS,
    credentials: false,
  });

  const jwtService = app.get(JwtService);

  const requireAdminForCertAsset = (req: Request, res: Response, nextFn: NextFunction): void => {
    const raw = req.headers.authorization ?? '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    if (!token) {
      res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
      return;
    }
    try {
      const payload = jwtService.verify<{ role: string }>(token);
      if (payload.role !== 'Admin') {
        res.status(403).json({ statusCode: 403, message: 'Forbidden' });
        return;
      }
      nextFn();
    } catch {
      res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
    }
  };

  const requireAuthForCertAsset = (req: Request, res: Response, nextFn: NextFunction): void => {
    if (req.method === 'OPTIONS') {
      nextFn();
      return;
    }
    const raw = req.headers.authorization ?? '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    if (!token) {
      res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
      return;
    }
    try {
      jwtService.verify(token);
      nextFn();
    } catch {
      res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
    }
  };

  app.use('/uploads/cert-signers', requireAdminForCertAsset);
  app.use('/uploads/cert-templates', requireAuthForCertAsset);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders(res: ServerResponse & { req: { headers?: { origin?: string } } }) {
      const origin = res.req.headers?.origin ?? '';
      if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      }
    },
  });

  const configService = app.get(ConfigService);
  const nodeEnv = configService.getOrThrow<string>('NODE_ENV');

  app.useGlobalFilters(new HttpExceptionFilter(configService));
  app.useGlobalInterceptors(new AuditInterceptor());

  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (nodeEnv === 'development') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Lifelong2 API')
      .setDescription('Backend API documentation')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
}

void bootstrap();
