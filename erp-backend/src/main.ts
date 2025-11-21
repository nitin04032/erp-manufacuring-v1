import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Yeh line bahut zaroori hai. Yeh सुनिश्चित karti hai ki sabhi DTOs automatically validate hon.
  app.useGlobalPipes(new ValidationPipe());

  // CORS ko enable karna taki frontend se request aa sake.
  app.enableCors({ origin: true, credentials: true });

  const port = parseInt(process.env.PORT ?? '3001', 10);
  try {
    await app.listen(port);
    console.log(`Nest application is listening on port ${port}`);
  } catch (err: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (err && err.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is already in use. Please stop the process using that port or set PORT env variable to a different port.`,
      );
      process.exit(1);
    }
    throw err;
  }
}
void bootstrap();
