import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Book, mockBooks } from './utils/mockBooks';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanHistory } from '../database/entities/loan.entity';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ListUsersQueryDto } from './dtos/listUserQuery.dto';

export interface LoanRecord {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: Date;
  returnedAt: Date | null;
  book: Book;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(LoanHistory)
    private loanHistoryRepository: Repository<LoanHistory>,
  ) {}

  async findAll(query: ListUsersQueryDto): Promise<{
    items: User[];
    total: number;
  }> {
    const whereConditions = {};
    if (query.email) whereConditions['email'] = query.email;
    if (query.firstName) whereConditions['firstName'] = query.firstName;
    if (query.lastName) whereConditions['lastName'] = query.lastName;
    if (query.phone) whereConditions['phone'] = query.phone;

    const take = query.perPage || 10;
    const skip = query.page || 0;

    const [result, total] = await this.usersRepository.findAndCount({
      where: whereConditions,
      take: take,
      skip: skip,
      order: { createdAt: 'DESC' },
    });

    return {
      items: result,
      total,
    };
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

  async getUserLoanHistory(userId: string): Promise<LoanRecord[]> {
    const loanRecords = await this.loanHistoryRepository.find({
      where: { userId },
      order: { borrowedAt: 'DESC' },
    });

    if (!loanRecords.length) {
      throw new NotFoundException('No loan records found for this user.');
    }

    return loanRecords.map((record) => ({
      id: record.id,
      userId: record.userId,
      bookId: record.bookId,
      borrowedAt: record.borrowedAt,
      returnedAt: record.returnedAt,
      book: mockBooks.find((book) => book.id === record.bookId) || {
        id: record.bookId,
        title: 'Unknown Book',
        author: 'Unknown Author',
        isbn: 'N/A',
        publishedYear: 0,
      },
    }));
  }
}
