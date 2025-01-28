import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class LoanHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  bookId: string;

  @Column()
  borrowedAt: Date;

  @Column({ nullable: true })
  returnedAt: Date | null;

  @ManyToOne(() => User, (user) => user.loans)
  user: User;
}
