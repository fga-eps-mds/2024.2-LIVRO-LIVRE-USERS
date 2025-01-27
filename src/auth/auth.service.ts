import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRoles } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dtos/signIn.dto';
import { SignInResponseDto } from './dtos/signInResponse.dto';
import { SignUpDto } from './dtos/signUp.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private validatePassword(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException('A senha deve ter pelo menos 8 caracteres.');
    }
    if (!hasUpperCase) {
      throw new BadRequestException('A senha deve conter pelo menos uma letra maiúscula.');
    }
    if (!hasNumber) {
      throw new BadRequestException('A senha deve conter pelo menos um número.');
    }
    if (!hasSpecialChar) {
      throw new BadRequestException('A senha deve conter pelo menos um caractere especial.');
    }
  }

  async signIn({
    email,
    password,
    role,
  }: SignInDto): Promise<SignInResponseDto> {
    const user = await this.usersRepository.findOneBy({ email, role });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(dto: SignUpDto): Promise<SignInResponseDto> {
    this.validatePassword(dto.password); // Validate password before proceeding

    const userExists = await this.usersRepository.findOneBy({
      email: dto.email,
    });
    if (userExists) throw new UnauthorizedException('Usuário já cadastrado.');

    const user = this.usersRepository.create({
      ...dto,
      role: UserRoles.User,
      password: await bcrypt.hash(dto.password, await bcrypt.genSalt(10)),
    });
    await this.usersRepository.save(user);
    return this.signIn({
      email: dto.email,
      password: dto.password,
      role: user.role,
    });
  }

  async getProfile(data: { sub: string; email: string }): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: data.sub });
    return user;
  }

  async recoverPassword(email: string): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) throw new UnauthorizedException('Usuário não encontrado.');

    const token = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '30m' },
    );
    const message = `Olá! Você solicitou a recuperação de senha. Para alterar sua senha, clique no link a seguir: ${process.env.APP_URL}/alterar-senha?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Livro Livre <${process.env.MAIL_USERNAME}>`,
      to: email,
      subject: 'Recuperação de senha - Livro Livre',
      text: message,
    });

    return { success: true };
  }

  async changePassword(
    id: string,
    password: string,
  ): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Usuário não encontrado.');
    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    await this.usersRepository.save(user);
    return { success: true };
  }
}