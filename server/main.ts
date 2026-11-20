import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  if (process.env.NODE_ENV === 'production') {
    app.useStaticAssets(join(__dirname, '../client'));
  }
  app.enableShutdownHooks();
  await app.listen(3000, process.env.HOST ?? '127.0.0.1');
}

void bootstrap();
