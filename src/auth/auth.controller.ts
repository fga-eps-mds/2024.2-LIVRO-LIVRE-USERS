import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signIn.dto';
import { AuthGuard } from './auth.guard';
import { SignUpDto } from './dtos/signUp.dto';
import { RecoverPasswordDto } from './dtos/recoverPassword.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  async signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @Post('signup')
  signup(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('recover-password')
  recoverPassword(@Body() body: RecoverPasswordDto) {
    return this.authService.recoverPassword(body.email);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  changePassword(@Body() body: ChangePasswordDto, @Request() req) {
    return this.authService.changePassword(req.user.sub, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user);
  }
}
