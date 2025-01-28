import { Module } from '@nestjs/common';
import { KohaService } from './koha.service';
import { KohaController } from './koha.controller';
import { KohaApiFactory } from './factory';

const KohaProviders = [
  KohaApiFactory,
  {
    provide: 'KOHA_API',
    useFactory: (factory: KohaApiFactory) => factory.create(),
    inject: [KohaApiFactory],
  },
  KohaService,
];

@Module({
  controllers: [KohaController],
  providers: [...KohaProviders],
})
export class KohaModule {}
