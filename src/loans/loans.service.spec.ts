import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoansService } from './loans.service';
import { Loan } from '../database/entities/loan.entity';
import { User } from '../database/entities/user.entity';

describe('LoansService', () => {
  let service: LoansService;
  let repository: Repository<Loan>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: getRepositoryToken(Loan),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    repository = module.get<Repository<Loan>>(getRepositoryToken(Loan));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find loans by user', async () => {
    const user = new User();
    user.id = '1';
    const loans = [new Loan(), new Loan()];
    jest.spyOn(repository, 'find').mockResolvedValue(loans);

    expect(await service.findLoansByUser(user.id)).toBe(loans);
  });
});