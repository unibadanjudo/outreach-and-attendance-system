import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RateLimiterGuard } from './common/guards/rate-limiter.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const sessionSecret = configService.get<string>('SESSION_SECRET', 'secret');

  // Global Prefix
  app.setGlobalPrefix('api');

  // Trust reverse proxy for secure cookies on Render/Vercel
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  // CORS Configuration
  const isProduction = nodeEnv === 'production';
  const rawFrontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173',
  );
  const frontendUrl = rawFrontendUrl.trim().replace(/\/+$/, '');
  const isLocalhost =
    frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');
  const isSecure = isProduction || !isLocalhost;

  const allowedOrigins = [
    frontendUrl,
    frontendUrl.replace('://', '://www.'),
    frontendUrl.replace('://www.', '://'),
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!requestOrigin) return callback(null, true);
      const cleanOrigin = requestOrigin.trim().replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin === frontendUrl ||
        (frontendUrl.includes('vercel.app') && cleanOrigin.endsWith('.vercel.app'))
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  // Session Management (Secure HTTP-Only Cookies)
  app.use(
    session({
      name: 'uijudo.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  // Passport & Session integration
  app.use(passport.initialize());
  app.use(passport.session());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Filters & Interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new RateLimiterGuard());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger Documentation
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('UI Judo Club API')
      .setDescription('Attendance and Member Outreach System API documentation')
      .setVersion('1.0.0')
      .addTag('Health', 'Health check endpoints')
      .addTag('Auth', 'Authentication and OAuth operations')
      .addTag('Members', 'Member management')
      .addTag('Attendance', 'Attendance tracking and analytics')
      .addTag('Outreach', 'Member inactivity and outreach workflows')
      .addTag('Dashboard', 'Executive club metrics and statistics')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(
      `Swagger documentation available at http://localhost:${port}/api/docs`,
    );
  }

  await app.listen(port, '0.0.0.0');
  logger.log(
    `Application is running in [${nodeEnv}] mode on http://localhost:${port}/api`,
  );
}

void bootstrap();
