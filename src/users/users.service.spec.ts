import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

const repositoryMockFactory = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [new User(), new User()];
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });
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

      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        ...user,
        ...updateData,
        password: 'newHashedPassword',
      });

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { oldPassword, newPassword, ...updatedData } = updateData;

      const result = await service.update('123', updateData);

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        updateData.oldPassword,
        'hashedPassword',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(updateData.newPassword, 'salt');
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        ...updatedData,
        password: 'newHashedPassword',
      });
      expect(result).toEqual({
        ...user,
        ...updatedData,
        password: 'newHashedPassword',
      });
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
});
