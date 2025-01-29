import { Test, TestingModule } from '@nestjs/testing';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { AuthGuard } from '../auth/auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('LoansController', () => {
  let controller: LoansController;
  let service: LoansService;

  const mockLoansService = {
    findLoansByUser: jest.fn((userId) => {
      return [{ id: 1, userId, bookId: 1, loanDate: new Date() }];
    }),
  };

  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: 'user123' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [
        {
          provide: LoansService,
          useValue: mockLoansService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<LoansController>(LoansController);
    service = module.get<LoansService>(LoansService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return loan history for a user', async () => {
    const req = { user: { sub: 'user123' } };
    const result = await controller.getLoanHistory(req);
    expect(result).toEqual([{ id: 1, userId: 'user123', bookId: 1, loanDate: new Date() }]);
    expect(service.findLoansByUser).toHaveBeenCalledWith('user123');
  });

  it('should call AuthGuard canActivate method', async () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: 'user123' } }),
      }),
    } as any;
    const canActivate = mockAuthGuard.canActivate(context);
    expect(canActivate).toBe(true);
    expect(mockAuthGuard.canActivate).toHaveBeenCalled();
  });
});