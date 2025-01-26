import { Test, TestingModule } from '@nestjs/testing';
import { KohaService } from './koha.service';

describe('KohaService', () => {
  let service: KohaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KohaService],
    }).compile();

    service = module.get<KohaService>(KohaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
