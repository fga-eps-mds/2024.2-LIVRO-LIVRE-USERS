import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRoles } from '../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from '../auth/dtos/signUp.dto';
import * as bcrypt from 'bcryptjs';
import { repositoryMockFactory } from '../../test/database/utils';
import { BadRequestException} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dtos/signIn.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';

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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'PASSWORD_MIN_LENGTH':
                  return 8;
                case 'PASSWORD_REQUIRE_UPPERCASE':
                  return true;
                case 'PASSWORD_REQUIRE_NUMBER':
                  return true;
                case 'PASSWORD_REQUIRE_SPECIAL_CHAR':
                  return true;
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
    jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(10);

    sendMailMock = jest.fn();
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as any);
  });
  afterEach(() =>{
    jest.restoreAllMocks();
  }

)

  describe('signUp', () => {
    it('deve criar um novo usuário e retornar um token assinado', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@email.com',
        phone: '123456789',
        password: 'Password123!',
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
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(userRepository.save).toHaveBeenCalled();
      expect(response).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('deve lançar um erro se o usuário já existir', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@email.com',
        phone: '123456789',
        password: 'Password123!',
      };

      const existingUser = new User();
      existingUser.email = 'test@email.com';

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(existingUser);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('deve lançar um erro se a senha não atender aos critérios', async () => {
      const signUpDto: SignUpDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@email.com',
        phone: '123456789',
        password: 'password',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signIn', () => {
    it('deve lançar um UnauthorizedException para credenciais inválidas', async () => {
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

    it('deve retornar um token assinado em caso de login bem-sucedido', async () => {
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

  describe('signIn with keepLoggedIn', () => {
    it('deve retornar um token com expiração de 30m quando keepLoggedIn for falso', async () => {
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

    it('deve retornar um token com expiração de 7d quando keepLoggedIn for verdadeiro', async () => {
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

  describe('getProfile', () => {
    it('deve retornar o perfil do usuário quando o usuário existe', async () => {
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

    it('deve retornar null quando o usuário não existe', async () => {
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
    it('deve lançar um UnauthorizedException se o usuário não for encontrado', async () => {
      const email = 'notfound@example.com';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      const signSpy = jest.spyOn(jwtService, 'signAsync');

      await expect(service.recoverPassword(email)).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(signSpy).not.toHaveBeenCalled();
    });

    it('deve lidar com erros durante o envio de e-mail', async () => {
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

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id },
        { expiresIn: '30m' },
      );
      expect(sendMailMock).toHaveBeenCalled();
    });

    it('deve enviar um e-mail de recuperação se o usuário for encontrado', async () => {
      const email = 'test@example.com';
      const user = new User();
      user.id = '123';
      user.email = email;

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('mocked-token');

      await service.recoverPassword(email);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id },
        { expiresIn: '30m' },
      );
      expect(sendMailMock).toHaveBeenCalled();
    });
  });
  describe('changePassword', () => {
    it('deve alterar a senha com sucesso', async () => {
        const changePasswordDto: ChangePasswordDto = {
            currentPassword: 'oldPassword',
            newPassword: 'NewPassword1!',
        };
        const userId = 'user-id';
        const user = new User();
        user.id = userId;
        user.password = await bcrypt.hash('oldPassword', 10);

        jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        jest.spyOn(userRepository, 'save').mockResolvedValue(user);

        await service.changePassword(userId, changePasswordDto);

        expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
        expect(bcrypt.compare).toHaveBeenCalledWith(
            changePasswordDto.currentPassword,
            user.password,
        );
        expect(bcrypt.hash).toHaveBeenCalledWith(
            changePasswordDto.newPassword,
            10,
        );
        expect(userRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
                password: expect.any(String)
            }),
        );
    });

    it('deve lançar UnauthorizedException quando a senha atual estiver errada', async () => {
        const userId = '1';
        const changePasswordDto: ChangePasswordDto = {
            currentPassword: 'wrongPassword',
            newPassword: 'NewPassword1!',
        };
        const user = new User();
        user.id = userId;
        user.password = 'hashedPassword';

        jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        await expect(
            service.changePassword(userId, changePasswordDto),
        ).rejects.toThrow(BadRequestException);

        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });
});
});