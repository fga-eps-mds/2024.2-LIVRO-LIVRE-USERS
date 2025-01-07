import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/database/entities/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(UserRoles.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put()
  @UseGuards(AuthGuard)
  update(@Request() req, @Body() body: UpdateUserDto) {
    return this.usersService.update(req.user.sub, body);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@Request() req) {
    return this.usersService.remove(req.user.sub);
  }
}
