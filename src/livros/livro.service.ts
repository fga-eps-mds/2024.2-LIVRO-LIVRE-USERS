
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Livro } from './entities/livro.entity';
import { LivroRepository } from './livro.repository';
import { FindOneOptions } from 'typeorm';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';

@Injectable()
export class LivrosService {
  constructor(
    @InjectRepository(Livro)
    private livrosRepository: LivroRepository,
  ) { }

  async buscarLivros(titulo?: string, autor?: string): Promise<Livro[]> {
    const queryBuilder = this.livrosRepository.createQueryBuilder('livro');
    queryBuilder.select(['livro.id', 'livro.titulo', 'livro.autor', 'livro.anoPublicacao', 'livro.editora', 'livro.genero', 'livro.preco', 'livro.descricao'])
    queryBuilder.leftJoinAndSelect('livro.genero', 'genero')
    queryBuilder.leftJoinAndSelect('livro.autor', 'autorEntity')

    if (titulo) {
      queryBuilder.where('livro.titulo ILIKE :titulo', { titulo: `%${titulo}%` });
    }
    if (autor) {
      queryBuilder.andWhere('livro.autor ILIKE :autor', { autor: `%${autor}%` });
    }

    const livros = await queryBuilder.getMany();

    if (livros.length === 0) {
      throw new NotFoundException('Nenhum livro encontrado com os critérios especificados.');
    }

    return livros; 
  }

  async buscarLivroPorId(id: string): Promise<Livro | undefined> {
    return this.livrosRepository.findOne({
       where: {id},
       select: ['id', 'titulo', 'autor', 'anoPublicacao', 'editora', 'genero', 'preco', 'descricao'],
    });
  }
  async criarLivro(createLivroDto: CreateLivroDto): Promise<Livro> {
    const novoLivro = this.livrosRepository.create(createLivroDto);
    return this.livrosRepository.save(novoLivro);
  }

  async atualizarLivro(id: string, updateLivroDto: UpdateLivroDto): Promise<Livro | undefined> {

    const livro = await this.livrosRepository.preload({
      id: id,
      ...updateLivroDto,
    });
    if (!livro) {
      return undefined;
    }
    return this.livrosRepository.save(livro);
  }

  async removerLivro(id: string): Promise<{ affected?: number }> {
    return this.livrosRepository.delete(id);
  }
}