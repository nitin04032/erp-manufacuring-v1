import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // ✅ Enable CORS (localhost + LAN IPs allowed)
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.0.113:3000", // allow LAN IPs in dev
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // ✅ Listen on 0.0.0.0 for LAN access
  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();
