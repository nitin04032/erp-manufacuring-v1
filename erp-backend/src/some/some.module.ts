import { Module } from '@nestjs/common';
import { SomeController } from './some.controller';
import { SomeService } from './some.service';

@Module({
  controllers: [SomeController],
  providers: [SomeService],
  exports: [SomeService],
})
export class SomeModule {}
