import { EntityRepository, FindOneOptions, Repository } from 'typeorm';
import { Livro } from './entities/livro.entity';

@EntityRepository(Livro)
export class LivroRepository extends Repository<Livro> { 

  async buscarLivros(titulo?: string, autor?: string): Promise<Livro[]> {
    const queryBuilder = this.createQueryBuilder('livro')
        .select(['livro.id', 'livro.titulo', 'livro.autor', 'livro.anoPublicacao', 'livro.editora', 'livro.genero'])
        .leftJoinAndSelect('livro.autor', 'autor') 
        .leftJoinAndSelect('livro.editora', 'editora');

        if (titulo) {
          queryBuilder.andWhere('livro.titulo ILIKE :titulo', { titulo: `%${titulo}%` });
      }
      if (autor) {
          queryBuilder.andWhere('livro.autor ILIKE :autor', { autor: `%${autor}%` });
      }
  
      return queryBuilder.getMany();
  }

  async buscarLivroPorId(id: string): Promise<Livro | undefined> {
    const options: FindOneOptions<Livro> = {
      where: { id },
      relations: ['autor', 'editora'],
      select: ['id', 'titulo', 'autor', 'anoPublicacao', 'editora', 'genero'],
    };

    return this.findOne(options);
  }


}