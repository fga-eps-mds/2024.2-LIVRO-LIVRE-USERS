import { Injectable } from '@nestjs/common';
import { User } from 'libs/database/entities/user.entity';
import { UserRepository } from 'libs/database/repositories/user.repository';
import { CreateUserDto } from './dtos/createUser.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  async create(data: CreateUserDto): Promise<User> {
    return this.userRepository.create({
      id: uuidv4(),
      ...data,
    });
  }

  findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  findOne(id: string): Promise<User | null> {
    return this.userRepository.findOneById(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.remove(id);
  }
}
