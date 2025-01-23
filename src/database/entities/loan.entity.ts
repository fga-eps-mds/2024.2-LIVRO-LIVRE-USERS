import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity()
  export class Loan {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    bookTitle: string;
  
    @ManyToOne(() => User, (user) => user.loans)
    user: User;
  
    @CreateDateColumn()
    borrowedAt: Date;
  
    @Column({ nullable: true })
    returnedAt: Date;
  }