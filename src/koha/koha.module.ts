import { Module } from '@nestjs/common';
import { KohaService } from './koha.service';
import { KohaController } from './koha.controller';

@Module({
  controllers: [KohaController],
  providers: [KohaService],
})
export class KohaModule {}
