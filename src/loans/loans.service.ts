import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from '../database/entities/loan.entity';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private loansRepository: Repository<Loan>,
  ) {}

  async findLoansByUser(userId: string): Promise<Loan[]> {
    return this.loansRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}