import { Test, TestingModule } from '@nestjs/testing';
import { KohaApiFactory } from './factory';
import { KohaApi } from './types';
import { KohaController } from './koha.controller';
import { KohaService } from './koha.service';

describe('KohaApiFactory', () => {
  let kohaApi: KohaApi;
  let controller: KohaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KohaController],
      providers: [
        KohaService,
        KohaApiFactory, // Adicionando KohaApiFactory ao módulo de teste
        {
          provide: 'KOHA_API',
          useFactory: (factory: KohaApiFactory) => factory.create(),
          inject: [KohaApiFactory],
        },
      ],
    }).compile();

    controller = module.get<KohaController>(KohaController);

    // Obtendo a instância de KohaApiFactory e chamando o método create
    const factory = module.get<KohaApiFactory>(KohaApiFactory);
    kohaApi = factory.create();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create Koha API instance', () => {
    expect(kohaApi).toBeDefined();
  });

  describe('User Service', () => {
    it('should sign up a user and return status 200', async () => {
      const signUpParams = { username: 'test_user', password: 'test_pass' };

      const result = await kohaApi.user.signUp(signUpParams);

      expect(result).toEqual({ status: 200 });
    });
  });

  describe('Books Service', () => {
    it('should return a list of 8 books with the correct details', () => {
      const books = kohaApi.books.search();

      expect(books).toHaveLength(8); // Verifica se o array contém 8 livros

      books.forEach((book, index) => {
        const expectedName = `The Great Gatsby ${index + 1}`; // Nome esperado de acordo com o índice

        // Valida as propriedades de cada livro
        expect(book).toHaveProperty('id', index + 1); // O id deve corresponder ao índice + 1
        expect(book).toHaveProperty('name', expectedName); // Nome sequencial esperado
        expect(book).toHaveProperty('author', 'F. Scott Fitzgerald');
        expect(book).toHaveProperty('publisher', "Charles Scribner's Sons");
        expect(book).toHaveProperty('year', '1925');
        expect(book).toHaveProperty(
          'cover',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/TheGreatGatsby_1925jacket.jpeg/220px-TheGreatGatsby_1925jacket.jpeg',
        );
      });
    });
  });
});
