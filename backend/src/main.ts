import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, raw } from 'express';

async function bootstrap() {
  // rawBody: true stores raw request bytes on req.rawBody for all requests
  // This is needed for Stripe/Square webhook signature verification
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Webhook routes need the unmodified raw body for signature verification.
  // Mount express.raw() FIRST so the body is a Buffer; otherwise json() will
  // parse and re-serialise (changing whitespace/key order) and signatures fail.
  const webhookPaths = [
    '/api/stripe/webhook',
    '/api/square/webhook',
    '/api/payments/webhooks/stripe',
  ];
  app.use(webhookPaths, raw({ type: '*/*', limit: '10mb' }));

  // Increase body size limit for base64 file uploads (resumes, images)
  app.use(json({ limit: '10mb' }));

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://fooddeliveryaudit.com',
      'https://www.fooddeliveryaudit.com',
      'https://admin.fooddeliveryaudit.com',
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 Eggs Ok API running on http://localhost:${port}/api - v2`);
}

bootstrap();