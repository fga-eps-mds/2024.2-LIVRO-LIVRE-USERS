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
  Query,
} from '@nestjs/common';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoles } from '../database/entities/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { ListUsersQueryDto } from './dtos/listUsersQuery.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(UserRoles.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
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
