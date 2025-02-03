import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { LoanHistory } from '../database/entities/loan.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { mockBooks } from './utils/mockBooks';

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

// Mock do repositório de User
const repositoryMockFactory = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

// Mock do repositório de LoanHistory
const loanHistoryRepositoryMockFactory = () => ({
  find: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let loanHistoryRepository: jest.Mocked<Repository<LoanHistory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(LoanHistory),
          useFactory: loanHistoryRepositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    loanHistoryRepository = module.get<Repository<LoanHistory>>(
      getRepositoryToken(LoanHistory),
    ) as jest.Mocked<Repository<LoanHistory>>;
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const user = new User();
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);

      const result = await service.findOne('123');
      expect(result).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '123' });
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      const result = await service.findOne('123');
      expect(result).toBeNull();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '123' });
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      jest.spyOn(userRepository, 'delete').mockResolvedValueOnce({} as any);

      await service.remove('123');
      expect(userRepository.delete).toHaveBeenCalledWith('123');
    });
  });

  describe('update', () => {
    let user: User;
    let updateData: any;

    beforeEach(() => {
      user = new User();
      user.password = 'hashedPassword';

      updateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      jest.clearAllMocks();
    });

    it('should update and return the user', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(user);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('newHashedPassword');

      (bcrypt.genSalt as jest.Mock).mockResolvedValueOnce('salt');

      const updatedUser = {
        ...user,
        ...updateData,
        password: 'newHashedPassword',
      };

      // Mock do save: retorna o objeto original *após* a atualização (simula o BD)
      jest
        .spyOn(userRepository, 'save')
        .mockImplementation(async (userToSave: User) => {
          // Simula a atualização:
          Object.assign(userToSave, updateData, {
            password: 'newHashedPassword',
          });
          return userToSave; // Retorna o objeto *após* a atualização
        });

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(updatedUser);

      const result = await service.update('123', updateData);

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        updateData.oldPassword,
        'hashedPassword',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(updateData.newPassword, 'salt');
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);

      await expect(service.update('123', updateData)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw UnauthorizedException if the old password is incorrect', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(user);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.update('123', updateData)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        updateData.oldPassword,
        'hashedPassword',
      );
    });
  });

  describe('getUserLoanHistory', () => {
    it('should return loan history for the user', async () => {
      const mockLoanRecords: LoanHistory[] = [
        {
          id: '1',
          userId: '123',
          bookId: '1',
          borrowedAt: new Date('2025-01-01'),
          returnedAt: null,
          user: { id: '123' } as User,
        } as LoanHistory,
        {
          id: '2',
          userId: '123',
          bookId: '2',
          borrowedAt: new Date('2025-01-02'),
          returnedAt: new Date('2025-01-10'),
          user: { id: '123' } as User,
        } as LoanHistory,
      ];

      loanHistoryRepository.find.mockResolvedValueOnce(mockLoanRecords);

      const result = await service.getUserLoanHistory('123');

      expect(result).toEqual([
        {
          id: '1',
          book: mockBooks.find((book) => book.id === '1'),
          borrowedAt: new Date('2025-01-01'),
          returnedAt: null,
        },
        {
          id: '2',
          book: mockBooks.find((book) => book.id === '2'),
          borrowedAt: new Date('2025-01-02'),
          returnedAt: new Date('2025-01-10'),
        },
      ]);

      expect(loanHistoryRepository.find).toHaveBeenCalledWith({
        where: { userId: '123' },
        order: { borrowedAt: 'DESC' },
      });
    });

    it('should throw NotFoundException if no loan records are found', async () => {
      loanHistoryRepository.find.mockResolvedValueOnce([]);

      await expect(service.getUserLoanHistory('123')).rejects.toThrow(
        NotFoundException,
      );
      expect(loanHistoryRepository.find).toHaveBeenCalledWith({
        where: { userId: '123' },
        order: { borrowedAt: 'DESC' },
      });
    });
  });
});
