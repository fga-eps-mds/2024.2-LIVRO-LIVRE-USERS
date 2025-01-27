import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

describe('ExportController', () => {
    let controller: ExportController;
    let exportService: ExportService;

    const mockExportService = {
        generateCsv: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ExportController],
            providers: [
                { provide: ExportService, useValue: mockExportService },
            ],
        }).compile();

        controller = module.get<ExportController>(ExportController);
        exportService = module.get<ExportService>(ExportService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('exportToCsv', () => {
        it('should return a CSV file if service works correctly', async () => {
            const mockCsv = 'id,name,email\n1,John Doe,john@example.com';
            mockExportService.generateCsv.mockResolvedValueOnce(mockCsv);

            const res = {
                header: jest.fn(),
                attachment: jest.fn(),
                send: jest.fn(),
            } as any;

            const query = {
                userIds: '1',
                userName: 'John',
                bookIds: '101,102',
                authors: 'Author1,Author2',
                themes: 'Theme1,Theme2',
            };

            await controller.exportToCsv(
                query.userIds,
                res,
                query.userName,
                query.bookIds,
                query.authors,
                query.themes,
            );

            expect(mockExportService.generateCsv).toHaveBeenCalledWith({
                userIds: ['1'],
                bookIds: ['101', '102'],
                authors: ['Author1', 'Author2'],
                themes: ['Theme1', 'Theme2'],
            });

            expect(res.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(res.attachment).toHaveBeenCalledWith('export.csv');
            expect(res.send).toHaveBeenCalledWith(mockCsv);
        });

        it('should handle errors correctly', async () => {
            mockExportService.generateCsv.mockRejectedValueOnce(new Error('Erro ao gerar CSV'));

            const res = {
                header: jest.fn(),
                attachment: jest.fn(),
                send: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            const query = {
                userIds: '1',
                userName: 'John',
                bookIds: '101,102',
                authors: 'Author1,Author2',
                themes: 'Theme1,Theme2',
            };

            await controller.exportToCsv(
                query.userIds,
                res,
                query.userName,
                query.bookIds,
                query.authors,
                query.themes,
            );

            expect(mockExportService.generateCsv).toHaveBeenCalledWith({
                userIds: ['1'],
                bookIds: ['101', '102'],
                authors: ['Author1', 'Author2'],
                themes: ['Theme1', 'Theme2'],
            });

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Erro ao gerar o arquivo CSV. Tente novamente mais tarde.',
            });
        });
    });
});
