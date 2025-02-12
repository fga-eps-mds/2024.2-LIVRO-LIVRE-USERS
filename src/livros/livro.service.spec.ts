import { Test, TestingModule } from '@nestjs/testing';
import { LivrosService } from './livro.service';
import { Livro } from './entities/livro.entity'
import { NotFoundException } from '@nestjs/common';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';
import { DeleteResult } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

describe('LivrosService', () => {
  let service: LivrosService;
  let mockQueryBuilder: any;
  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;
  let preloadMock: jest.Mock;
  let deleteMock: jest.Mock;


  beforeEach(async () => {
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };


    findOneMock = jest.fn();
    createMock = jest.fn();
    saveMock = jest.fn();
    preloadMock = jest.fn();
    deleteMock = jest.fn();


    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Livro],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Livro]),
      ],
      providers: [
        LivrosService,
        {
          provide: getRepositoryToken(Livro),
          useValue: {
            createQueryBuilder: (() => mockQueryBuilder),
            findOne: findOneMock,
            create: createMock,
            save: saveMock,
            preload: preloadMock,
            delete: deleteMock,
          },
        },
      ],
    }).compile();

    service = module.get<LivrosService>(LivrosService);
  },10000);// Aumento do timeout para 10 segundos

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buscarLivros', () => {
    it('should return an array of livros when livros are found', async () => {
      const mockLivros: Livro[] = [
        { id: '1', titulo: 'Livro 1', autor: 'Autor 1', anoPublicacao: 2023, editora: 'Editora A', genero: 'Ficção', preco: 20, descricao: 'Teste' } as Livro,
      ];
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue(mockLivros);
      const livros = await service.buscarLivros('Livro 1', 'Autor 1');
      expect(livros).toEqual(mockLivros);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('livro.titulo ILIKE :titulo', { titulo: '%Livro 1%' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('livro.autor ILIKE :autor', { autor: '%Autor 1%' });

    });

    it('should throw NotFoundException when no livros are found', async () => {


      await expect(service.buscarLivros('Livro Inexistente', 'Autor Inexistente'))
        .rejects.toThrow(NotFoundException);
    });

    it('should call query builder with correct parameters', async () => {
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue([{ id: '1', titulo: 'Livro Teste', autor: 'Autor Teste' } as Livro]); 

      await service.buscarLivros('Livro Teste', 'Autor Teste');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('livro.titulo ILIKE :titulo', { titulo: '%Livro Teste%' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('livro.autor ILIKE :autor', { autor: '%Autor Teste%' });
    });

    it('should call query builder with correct parameters when only titulo', async () => {
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue([{id: "1", titulo: "Livro Teste"} as Livro])

      await service.buscarLivros('Livro Teste', undefined);
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('livro.titulo ILIKE :titulo', { titulo: '%Livro Teste%' });
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should call query builder with correct parameters when only autor', async () => {

      mockQueryBuilder.getMany = jest.fn().mockResolvedValue([{id: "1", autor: "Autor Teste"} as Livro])

      await service.buscarLivros(undefined, 'Autor Teste');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('livro.autor ILIKE :autor', { autor: '%Autor Teste%' });
    });

    it('should call query builder without where/andWhere when no parameters', async () => {
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue([{id: "1"} as Livro]);
      await service.buscarLivros();

      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });


  describe('buscarLivroPorId', () => {
    it('should return a livro when livro is found', async () => {
      const mockLivro: Livro = { id: '1', titulo: 'Livro 1', autor: 'Autor 1', anoPublicacao: 2023, editora: 'Editora A', genero: 'Ficção', preco: 30, descricao: 'Uma descrição' } as Livro;
      findOneMock.mockResolvedValue(mockLivro);


      const livro = await service.buscarLivroPorId('1');
      expect(livro).toEqual(mockLivro);
      expect(findOneMock).toHaveBeenCalledWith({
        where: { id: '1' },
        select: ['id', 'titulo', 'autor', 'anoPublicacao', 'editora', 'genero', 'preco', 'descricao'],
      });
    });

    it('should return undefined when livro is not found', async () => {
      findOneMock.mockResolvedValue(undefined);
      const livro = await service.buscarLivroPorId('1');
      expect(livro).toBeUndefined();
      expect(findOneMock).toHaveBeenCalledWith({
        where: { id: '1' },
        select: ['id', 'titulo', 'autor', 'anoPublicacao', 'editora', 'genero', 'preco', 'descricao'],
      });
    });

    describe('criarLivro', () => {
      it('should create and return a new livro', async () => {
        const createLivroDto: CreateLivroDto = { titulo: 'Novo Livro', autor: 'Autor Novo', anoPublicacao: 2024, editora: 'Nova Editora', genero: 'Romance', preco: 20, descricao: 'Teste' };
        const mockCreatedLivro: Livro = { id: '2', ...createLivroDto } as Livro;

        createMock.mockReturnValue(mockCreatedLivro);
        saveMock.mockResolvedValue(mockCreatedLivro);


        const novoLivro = await service.criarLivro(createLivroDto);
        expect(novoLivro).toEqual(mockCreatedLivro);
        expect(createMock).toHaveBeenCalledWith(createLivroDto);
        expect(saveMock).toHaveBeenCalledWith(mockCreatedLivro);
      });
    });

    describe('atualizarLivro', () => {
      it('should update and return an existing livro', async () => {
        const id = '1';
        const updateLivroDto: UpdateLivroDto = { titulo: 'Livro Atualizado' };
        const mockExistingLivro: Livro = { id, titulo: 'Livro 1', autor: 'Autor 1', anoPublicacao: 2023, editora: 'Editora A', genero: 'Ficção', preco: 20, descricao: 'Teste' } as Livro;
        const mockUpdatedLivro: Livro = { ...mockExistingLivro, ...updateLivroDto } as Livro;
        preloadMock.mockResolvedValue(mockUpdatedLivro);
        saveMock.mockResolvedValue(mockUpdatedLivro);

        const updatedLivro = await service.atualizarLivro(id, updateLivroDto);
        expect(updatedLivro).toEqual(mockUpdatedLivro);
        expect(preloadMock).toHaveBeenCalledWith({ id, ...updateLivroDto });
        expect(saveMock).toHaveBeenCalledWith(mockUpdatedLivro);
      });

      it('should return undefined if livro to update is not found', async () => {
        const id = '1';
        const updateLivroDto: UpdateLivroDto = { titulo: 'Livro Atualizado' };

        preloadMock.mockResolvedValue(undefined);

        const updatedLivro = await service.atualizarLivro(id, updateLivroDto);

        expect(updatedLivro).toBeUndefined();
        expect(preloadMock).toHaveBeenCalledWith({ id, ...updateLivroDto });
      });
    });

    describe('removerLivro', () => {
      it('should delete an existing livro', async () => {
        const id = '1';
        const mockDeleteResult: DeleteResult = { affected: 1, raw: {} };

        deleteMock.mockResolvedValue(mockDeleteResult);

        const result = await service.removerLivro(id);
        expect(result).toEqual(mockDeleteResult);
        expect(deleteMock).toHaveBeenCalledWith(id);
      });
      it('should return affected 0', async () => {
        const id = '1';
        const mockDeleteResult: DeleteResult = { affected: 0, raw: {} };
        deleteMock.mockResolvedValue(mockDeleteResult);

        const result = await service.removerLivro(id);
        expect(result).toEqual(mockDeleteResult);
        expect(deleteMock).toHaveBeenCalledWith(id);
      })
    });
  });
});