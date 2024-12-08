import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dtos/signIn.dto';
import { SignInResponseDto } from './dtos/signInResponse.dto';
import { SignUpDto } from './dtos/signUp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signIn({ email, password }: SignInDto): Promise<SignInResponseDto> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '60m',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async signUp(dto: SignUpDto): Promise<User> {
    const userExists = await this.usersRepository.findOneBy({
      email: dto.email,
    });
    if (userExists) throw new UnauthorizedException('Usuário já cadastrado.');
    const user = this.usersRepository.create({
      ...dto,
      password: await bcrypt.hash(dto.password, await bcrypt.genSalt(10)),
    });
    await this.usersRepository.save(user);
    return user;
  }
}
