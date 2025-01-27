import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { Response } from 'express';

describe('ExportController', () => {
  let controller: ExportController;
  let mockExportService: Partial<ExportService>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockExportService = {
      generateCsv: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      header: jest.fn(),
      attachment: jest.fn(),
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [{ provide: ExportService, useValue: mockExportService }],
    }).compile();

    controller = module.get<ExportController>(ExportController);
  });

  it('should return a 400 error if no userIds are provided', async () => {
    await controller.exportToCsv(undefined, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Parâmetro "userIds" é obrigatório.',
    });
  });

  it('should generate a CSV if userIds are provided', async () => {
    const mockCsv = 'id,name\n1,User One\n2,User Two';
    (mockExportService.generateCsv as jest.Mock).mockResolvedValue(mockCsv);

    const userIds = '1,2';

    await controller.exportToCsv(userIds, mockResponse as Response);

    expect(mockResponse.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(mockResponse.attachment).toHaveBeenCalledWith('export.csv');
    expect(mockResponse.send).toHaveBeenCalledWith(mockCsv);
  });

  it('should return a 500 error if an exception is thrown', async () => {
    const errorMessage = 'Erro inesperado';
    (mockExportService.generateCsv as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const userIds = '1,2';

    await controller.exportToCsv(userIds, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: errorMessage,
    });
  });
});
