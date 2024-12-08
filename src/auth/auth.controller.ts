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

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user);
  }
}
