import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Global validation for DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000; // 👈 default backend 4000
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
