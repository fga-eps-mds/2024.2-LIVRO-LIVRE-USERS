import { Test, TestingModule } from '@nestjs/testing';
import { ExportService, ExportOptions } from './export.service';
import { UsersService } from '../users/users.service';
import { BooksService } from './export.mockBooks';
import { parse } from 'json2csv';

describe.skip('ExportService', () => {
  let exportService: ExportService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersService: UsersService;
  let booksService: BooksService;

  const mockUsersService = {
    findByIds: jest.fn(),
  };

  const mockBooksService = {
    findBooksByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: BooksService, useValue: mockBooksService },
      ],
    }).compile();

    exportService = module.get<ExportService>(ExportService);
    usersService = module.get<UsersService>(UsersService);
    booksService = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(exportService).toBeDefined();
  });

  describe('generateCsv', () => {
    it('should generate a valid CSV for users and books', async () => {
      const mockUsers = [
        {
          id: '1', firstName: 'Bruno', lastName: 'Cruz', email: 'bruno.cruz@example.com', phone: '123456789',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
      ];
      const mockBooks = [
        {
          id: '101', titulo: 'Titulo do livro', autor: 'Author do livro', tema: 'Tema do livro', rating: 5, imageUrl: 'image.jpg',
        },
      ];

      mockUsersService.findByIds.mockResolvedValue(mockUsers);
      mockBooksService.findBooksByIds.mockResolvedValue(mockBooks);

      const options: ExportOptions = { userIds: ['1'], bookIds: ['101'] };
      const result = await exportService.generateCsv(options);

      const expectedUserCsv = parse(mockUsers.map(user => ({
        id: user.id, name: `${user.firstName} ${user.lastName}`, lastName: user.lastName,
        email: user.email, phone: user.phone, createdAt: user.createdAt, updatedAt: user.updatedAt,
      })), {
        fields: [
          { label: 'ID', value: 'id' },
          { label: 'Nome', value: 'name' },
          { label: 'Sobrenome', value: 'lastName' },
          { label: 'Email', value: 'email' },
          { label: 'Telefone', value: 'phone' },
          { label: 'Criado em', value: 'createdAt' },
          { label: 'Atualizado em', value: 'updatedAt' },
        ],
      });

<<<<<<< HEAD
      const expectedBookCsv = parse(mockBooks, {
        fields: [
          { label: 'ID', value: 'id' },
          { label: 'Titulo', value: 'titulo' },
          { label: 'Autor', value: 'autor' },
          { label: 'Tema', value: 'tema' },
          { label: 'Avaliacao', value: 'rating' },
          { label: 'Capa', value: 'imageUrl' },
        ],
      });

      expect(result).toEqual(`${expectedUserCsv}\n${expectedBookCsv}`);
=======
      expect(mockUsersService.findByIds).toHaveBeenCalledWith([
        '3ca3b9b8-2883-41af-85c9-4826f941cd80',
      ]);
      expect(result).toEqual(expectedCsv);
>>>>>>> d1fa6772f809bdcda8f1e9b91403a55fce476077
    });

    it('should throw an error if no userIds or bookIds are provided', async () => {
      const options: ExportOptions = {};
      await expect(exportService.generateCsv(options)).rejects.toThrowError(
        'Nenhum usuário ou livro encontrado para exportação. Verifique os IDs fornecidos.'
      );
    });

<<<<<<< HEAD
    it('should throw an error if some bookIds are not found', async () => {
      mockBooksService.findBooksByIds.mockResolvedValue([]);
      const options: ExportOptions = { bookIds: ['999'] };
      await expect(exportService.generateCsv(options)).rejects.toThrowError(
        'Os seguintes IDs de livros não foram encontrados no banco de dados: 999'
      );
    });

=======
>>>>>>> d1fa6772f809bdcda8f1e9b91403a55fce476077
    it('should throw an error if some userIds are not found', async () => {
      mockBooksService.findBooksByIds.mockResolvedValue([]);
      const options: ExportOptions = { userIds: ['888'] };
      await expect(exportService.generateCsv(options)).rejects.toThrowError(
        'Os seguintes IDs de usuários não foram encontrados no banco de dados: 888'
      );
    });
  });

  
});
