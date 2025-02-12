import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Livro {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    titulo: string;

    @Column()
    autor: string;

    @Column({ type: 'int', nullable: true })
    anoPublicacao: number;

    @Column({ nullable: true })
    editora: string;

    @Column({ nullable: true })
    genero: string;

    @Column({ nullable: true, type: 'real' })
    preco?: number;

    @Column({ nullable: true, type: 'text' })
    descricao?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

export default Livro;