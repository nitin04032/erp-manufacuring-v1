import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Yeh line bahut zaroori hai. Yeh सुनिश्चित karti hai ki sabhi DTOs automatically validate hon.
  app.useGlobalPipes(new ValidationPipe());

  // CORS ko enable karna taki frontend se request aa sake.
  app.enableCors();
  
  await app.listen(3001);
}
bootstrap();