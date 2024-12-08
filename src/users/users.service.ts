import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException();

    user.firstName = updateData.firstName;
    user.lastName = updateData.lastName;
    user.email = updateData.email;
    user.phone = updateData.phone;

    if (updateData.newPassword && updateData.oldPassword) {
      if (!(await bcrypt.compare(updateData.oldPassword, user.password))) {
        throw new UnauthorizedException('Please check your login credentials');
      }
      user.password = await bcrypt.hash(
        updateData.newPassword,
        await bcrypt.genSalt(10),
      );
    }

    await this.usersRepository.save(user);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
