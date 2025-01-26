import { Test, TestingModule } from '@nestjs/testing';
import { KohaController } from './koha.controller';
import { KohaService } from './koha.service';

describe('KohaController', () => {
  let controller: KohaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KohaController],
      providers: [KohaService],
    }).compile();

    controller = module.get<KohaController>(KohaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
