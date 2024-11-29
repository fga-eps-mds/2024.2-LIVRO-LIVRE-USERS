import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { IUser } from 'libs/types/user.type';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(data: IUser): Promise<User> {
    const user = this.usersRepository.create(data);
    await this.usersRepository.save(user);
    return user;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOneById(id: string): Promise<User | null> {
    return this.usersRepository.createQueryBuilder().where({ id }).getOne()
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.createQueryBuilder().where({ email }).getOne()
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
