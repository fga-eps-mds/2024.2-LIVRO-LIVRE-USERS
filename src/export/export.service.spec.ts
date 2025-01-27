import { Test, TestingModule } from '@nestjs/testing';
import { ExportService, ExportOptions } from './export.service';
import { UsersService } from '../users/users.service';
import { parse } from 'json2csv';

describe('ExportService', () => {
  let exportService: ExportService;
  let usersService: UsersService;

  const mockUsersService = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    exportService = module.get<ExportService>(ExportService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(exportService).toBeDefined();
  });

  describe('generateCsv', () => {
    it('should generate a valid CSV when valid userIds are provided', async () => {
      const mockUsers = [
        {
          id: '3ca3b9b8-2883-41af-85c9-4826f941cd80',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockUsersService.findByIds.mockResolvedValue(mockUsers);

      const options: ExportOptions = {
        userIds: ['3ca3b9b8-2883-41af-85c9-4826f941cd80'],
      };

      const result = await exportService.generateCsv(options);

      const expectedCsv = parse(
        mockUsers.map((user) => ({
          type: 'User',
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        {
          fields: [
            { label: 'ID', value: 'id' },
            { label: 'Nome', value: 'name' },
            { label: 'Sobrenome', value: 'lastName' },
            { label: 'Email', value: 'email' },
            { label: 'Telefone', value: 'phone' },
            { label: 'Criado em', value: 'createdAt' },
            { label: 'Atualizado em', value: 'updatedAt' },
          ],
        },
      );

      expect(mockUsersService.findByIds).toHaveBeenCalledWith(['3ca3b9b8-2883-41af-85c9-4826f941cd80']);
      expect(result).toEqual(expectedCsv);
    });

    it('should return an empty CSV if no userIds are provided', async () => {
      const options: ExportOptions = {
        userIds: [],
      };

      mockUsersService.findByIds.mockResolvedValue([]);

      await expect(exportService.generateCsv(options)).rejects.toThrowError(
        'Nenhum usuário encontrado para exportação. Verifique os IDs fornecidos.',
      );

      expect(mockUsersService.findByIds).not.toHaveBeenCalled();
    });


    it('should throw an error if some userIds are not found', async () => {
      const mockUsers = [
        {
          id: '3ca3b9b8-2883-41af-85c9-4826f941cd80',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockUsersService.findByIds.mockResolvedValue(mockUsers);

      const options: ExportOptions = {
        userIds: [
          '3ca3b9b8-2883-41af-85c9-4826f941cd80',
          '0f8fad5b-d9cb-469f-a165-70867728950e',
        ],
      };

      await expect(exportService.generateCsv(options)).rejects.toThrowError(
        'Os seguintes IDs não foram encontrados no banco de dados: 0f8fad5b-d9cb-469f-a165-70867728950e',
      );

      expect(mockUsersService.findByIds).toHaveBeenCalledWith([
        '3ca3b9b8-2883-41af-85c9-4826f941cd80',
        '0f8fad5b-d9cb-469f-a165-70867728950e',
      ]);
    });
  });
});
