import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  theme: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  averageRating: number; // Média de avaliação dos usuários (0.0 a 5.0)

  @Column({ nullable: true })
  coverUrl: string; // URL da capa do livro

}
