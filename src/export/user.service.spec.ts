import { Test, TestingModule } from '@nestjs/testing';
import { ExportService, ExportOptions } from './export.service';
import { UsersService } from 'src/users/users.service';
import { parse } from 'json2csv';

describe('ExportService', () => {
  let exportService: ExportService;
  let usersService: UsersService;

  const mockUsersService = {
    findByIds: jest.fn(),
  };

  jest.mock('src/users/users.service', () => {
    return jest.requireActual('../../users/users.service');
  });

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
    it('should generate CSV for users with additional parameters', async () => {
      const mockUsers = [
        {
          id: '1',
          firstName: 'Bruno',
          lastName: 'Cruz',
          email: 'bruno.cruz@example.com',
          phone: '123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          firstName: 'Joao',
          lastName: 'Lucas',
          email: 'joao.lucas@example.com',
          phone: '987654321',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockUsersService.findByIds.mockResolvedValue(mockUsers);

      const options: ExportOptions = {
        userIds: ['1', '2'],
        bookIds: ['101', '102'],
        authors: ['Author1', 'Author2'],
        themes: ['Theme1', 'Theme2'],
      };

      const result = await exportService.generateCsv(options);

      const expectedCsv = parse(
        mockUsers.map(user => ({
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

      expect(mockUsersService.findByIds).toHaveBeenCalledWith(['1', '2']);
      expect(result).toEqual(expectedCsv);
    });

    it('should return an empty CSV when no userIds are provided', async () => {
      const options: ExportOptions = {
        userIds: [],
        bookIds: [],
        authors: [],
        themes: [],
      };

      const result = await exportService.generateCsv(options);

      const expectedCsv = parse([], {
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

      expect(result).toEqual(expectedCsv);
      expect(mockUsersService.findByIds).not.toHaveBeenCalled();
    });

    it('should handle missing optional parameters gracefully', async () => {
      const mockUsers = [
        {
          id: '1',
          firstName: 'Bruno',
          lastName: 'Cruz',
          email: 'bruno.cruz@example.com',
          phone: '123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockUsersService.findByIds.mockResolvedValue(mockUsers);

      const options: ExportOptions = {
        userIds: ['1'],
      };

      const result = await exportService.generateCsv(options);

      const expectedCsv = parse(
        mockUsers.map(user => ({
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

      expect(mockUsersService.findByIds).toHaveBeenCalledWith(['1']);
      expect(result).toEqual(expectedCsv);
    });
  });
});
