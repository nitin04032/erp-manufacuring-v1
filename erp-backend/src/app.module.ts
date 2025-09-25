import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SystemModule } from './system/system.module'; // ✅ Add this

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SystemModule, // ✅ Now your system/status API will work
  ],
})
export class AppModule {}
