import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import karein
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// ... other modules

@Module({
  imports: [
    // ConfigModule ko sabse pehle import karein
    ConfigModule.forRoot({
      isGlobal: true, // Taaki har module mein available ho
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') ?? '3306', 10),
        username: configService.get<string>('DB_USERNAME') ?? 'root',
        password: configService.get<string>('DB_PASSWORD') ?? '',
        database: configService.get<string>('DB_DATABASE') ?? 'erp',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Production mein isko false kar dein
      }),
    }),
    AuthModule,
    UsersModule,
    // ... other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}