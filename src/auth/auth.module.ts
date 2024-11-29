import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'libs/database/entities/user.entity';
import { UserRepository } from 'libs/database/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { jwtContants } from './auth.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: jwtContants.secret,
      signOptions: { expiresIn: '60s'},
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository]
})
export class AuthModule {}
