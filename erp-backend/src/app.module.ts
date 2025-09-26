// erp-backend/src/app.module.ts (UPDATED)

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SystemModule } from './system/system.module';
// ... other modules

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost', // Isko .env file mein daalna aage seekhenge
      port: 3306,
      username: 'root',   // Isko bhi
      password: '',       // Isko bhi
      database: 'your_erp_database_name', // Apne database ka naam yahan likhein
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Development ke liye theek hai, production mein false rakhein
    }),
    AuthModule,
    UsersModule,
    SystemModule,// ... other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}