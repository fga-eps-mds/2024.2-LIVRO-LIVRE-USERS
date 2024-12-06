import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.createQueryBuilder().where({ email }).getOne()
    if (!user) throw new UnauthorizedException();
    if (user.password !== password) throw new UnauthorizedException();
    return {
      accessToken: await this.jwtService.signAsync({ sub: user.id, email: user.email }),
    };
  }
}
