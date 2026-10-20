import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { seed } from './database/seed.js';

async function bootstrap() {
  const app = configureApp(await NestFactory.create(AppModule));
  await seed(app.get(DataSource));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
