import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'libs/database/repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();
    if (user.password !== password) throw new UnauthorizedException();
    return {
      accessToken: await this.jwtService.signAsync({ sub: user.id, email: user.email }),
    };
  }
}
