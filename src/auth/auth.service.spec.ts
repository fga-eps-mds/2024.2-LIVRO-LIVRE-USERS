import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRoles } from '../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from '../auth/dtos/signUp.dto';
import * as bcrypt from 'bcryptjs';
import { repositoryMockFactory } from '../../test/database/utils';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SignInDto } from './dtos/signIn.dto';


describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(async (payload) => {
              if (payload) {
                return 'access-token';
              }
              throw new Error('Payload não fornecido');
            }),
            verifyAsync: jest.fn(async () => 'refresh-token'),
          },
        },
      ],
    }).compile();
  
    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
    jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(10);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
  
    sendMailMock = jest.fn();
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as any);
  });
  //signUp
  describe('signUp', () => {
    it('should create a new user and return a signed token', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@email.com',
        phone: '123456789',
        password: 'ValidPassword123!', // Ensure the password meets the criteria
      };
  
      const user = new User();
      user.id = '18ea976e-367b-4138-b68e-7aff3f7ae4de';
      user.firstName = signUpDto.firstName;
      user.lastName = signUpDto.lastName;
      user.email = signUpDto.email;
      user.phone = signUpDto.phone;
      user.role = UserRoles.User;
  
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(service, 'signIn').mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
  
      const response = await service.signUp(signUpDto);
  
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: 'test@email.com',
      });
  
      expect(userRepository.create).toHaveBeenCalledWith({
        ...signUpDto,
        role: UserRoles.User,
        password: expect.any(String),
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('ValidPassword123!', 10);
      expect(userRepository.save).toHaveBeenCalled();
      expect(response).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  
    it('should throw an error if user already exists', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@email.com',
        phone: '123456789',
        password: 'ValidPassword123!', // Ensure the password meets the criteria
      };
  
      const existingUser = new User();
      existingUser.email = 'test@email.com';
  
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(existingUser);
  
      await expect(service.signUp(signUpDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect((await service.signUp(signUpDto).catch(e => e)).message).toBe('Usuário já cadastrado.');
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should throw an UnauthorizedException for invalid credentials', async () => {
      const email = 'test@email.com';
      const password = 'wrongPassword';
      const role = UserRoles.User;
      const user = new User();
      user.email = email;
      user.password = 'hashedPassword';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(service.signIn({ email, password, role })).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email, role });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });

    it('should return a signed token on successful login', async () => {
      const email = 'test@email.com';
      const password = 'validPassword';
      const role = UserRoles.User;
      const user = new User();
      user.id = '18ea976e-367b-4138-b68e-7aff3f7ae4de';
      user.email = email;
      user.password = await bcrypt.hash(password, 10);
      user.role = UserRoles.User;

      const payload = { sub: user.id, email, role: user.role };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const response = await service.signIn({ email, password, role });

      expect(response).toEqual({
        accessToken: 'access-token',
        refreshToken: 'access-token',
      });

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email, role });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile when user exists', async () => {
      const userId = '123';
      const user = new User();
      user.id = userId;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);

      const result = await service.getProfile({
        sub: userId,
        email: 'test@example.com',
      });

      expect(result).toBe(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });

    it('should return null when user does not exist', async () => {
      const userId = '123';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      const result = await service.getProfile({
        sub: userId,
        email: 'test@example.com',
      });

      expect(result).toBeNull();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });

  describe('recoverPassword', () => {
    it('should throw UnauthorizedException if the user is not found', async () => {
      const email = 'nonexistent@example.com';
  
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
  
      await expect(service.recoverPassword(email)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  
    it('should handle errors during email sending', async () => {
      const email = 'test@example.com';
      const user = new User();
      user.id = '123';
      user.email = email;
  
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('mocked-token');
      sendMailMock.mockRejectedValueOnce(new Error('Email service error'));
  
      await expect(service.recoverPassword(email)).rejects.toThrow(
        'Email service error',
      );
    });
  });

  describe('signIn with keepLoggedIn', () => {
    it('should return a token with 30m expiration when keepLoggedIn is false', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password',
        role: UserRoles.User,
        keepLoggedIn: false,
      };
      const user = new User();
      user.id = 'user-id';
      user.email = signInDto.email;
      user.password = 'hashed-password';
      user.role = UserRoles.User;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const signAsyncSpy = jest.spyOn(jwtService, 'signAsync');

      const result = await service.signIn(signInDto);

      expect(result.accessToken).toBeDefined();

      expect(signAsyncSpy).toHaveBeenNthCalledWith(
        1,
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: '30m' },
      );
    });

    it('should return a token with 7d expiration when keepLoggedIn is true', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password',
        role: UserRoles.User,
        keepLoggedIn: true,
      };
      const user = new User();
      user.id = 'user-id';
      user.email = signInDto.email;
      user.password = 'hashed-password';
      user.role = UserRoles.User;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const signAsyncSpy = jest.spyOn(jwtService, 'signAsync');

      const result = await service.signIn(signInDto);

      expect(result.accessToken).toBeDefined();

      expect(signAsyncSpy).toHaveBeenNthCalledWith(
        1,
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: '7d' },
      );
    });
  });

  describe('generateAccessToken', () => {
    it('should generate an access token with the given payload and expiration', async () => {
      const payload = { sub: '123', email: 'test@example.com', role: UserRoles.User };
      const expiresIn = '30m';
  
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('access-token');
  
      const result = await service.generateAccessToken(payload, expiresIn);
  
      expect(result).toBe('access-token');
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload, { expiresIn });
    });
  });
  
  describe('generateRefreshToken', () => {
    it('should generate a refresh token with the given payload', async () => {
      const payload = { sub: '123', email: 'test@example.com', role: UserRoles.User };
  
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('refresh-token');
  
      const result = await service.generateRefreshToken(payload);
  
      expect(result).toBe('refresh-token');
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload);
    });
  });

  describe('changePassword', () => {
    it('should update the password if the user exists', async () => {
      const userId = '123';
      const newPassword = 'NewPassword123!';
      const user = new User();
      user.id = userId;
      user.password = 'oldPassword';
  
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedNewPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(user);
  
      const result = await service.changePassword(userId, newPassword);
  
      expect(result).toEqual({ success: true });
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  
    it('should throw UnauthorizedException if the user does not exist', async () => {
      const userId = 'nonexistent';
      const newPassword = 'NewPassword123!';
  
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
  
      await expect(service.changePassword(userId, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validatePassword', () => {
    it('should throw BadRequestException if password is less than 8 characters', async () => {
      const shortPassword = 'Pass1!'; // 6 characters, missing length
      await expect(() =>
        (service as any).validatePassword(shortPassword),
      ).toThrowError(BadRequestException);
      await expect(() =>
        (service as any).validatePassword(shortPassword),
      ).toThrowError('A senha deve ter pelo menos 8 caracteres.');
    });
  
    it('should throw BadRequestException if password has no uppercase letter', async () => {
      const noUppercasePassword = 'password1!'; // Missing uppercase
      await expect(() =>
        (service as any).validatePassword(noUppercasePassword),
      ).toThrowError(BadRequestException);
      await expect(() =>
        (service as any).validatePassword(noUppercasePassword),
      ).toThrowError('A senha deve conter pelo menos uma letra maiúscula.');
    });
  
    it('should throw BadRequestException if password has no number', async () => {
      const noNumberPassword = 'Password!'; // Missing number
      await expect(() =>
        (service as any).validatePassword(noNumberPassword),
      ).toThrowError(BadRequestException);
      await expect(() =>
        (service as any).validatePassword(noNumberPassword),
      ).toThrowError('A senha deve conter pelo menos um número.');
    });
  
    it('should throw BadRequestException if password has no special character', async () => {
      const noSpecialCharPassword = 'Password1'; // Missing special character
      await expect(() =>
        (service as any).validatePassword(noSpecialCharPassword),
      ).toThrowError(BadRequestException);
      await expect(() =>
        (service as any).validatePassword(noSpecialCharPassword),
      ).toThrowError('A senha deve conter pelo menos um caractere especial.');
    });
  
    it('should not throw an exception if password meets all criteria', async () => {
      const validPassword = 'ValidPassword123!'; // Meets all criteria
      expect(() =>
        (service as any).validatePassword(validPassword),
      ).not.toThrow();
    });
  });
  
});