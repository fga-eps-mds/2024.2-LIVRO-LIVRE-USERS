import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExportService, ExportOptions } from './export.service';
import { Response } from 'express';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  async exportToCsv(
    @Query('userIds') userIds: string | undefined,
    @Query('bookIds') bookIds: string | undefined,
    @Res() res: Response,
  ) {
    try {
      if (!userIds && !bookIds) {
        console.log('Nenhum userId ou bookIds foi fornecido na query.');
        return res.status(400).json({
          message: 'Parâmetro "userIds" ou "bookIds" é obrigatório.',
        });
      }

      const userIdsArray = userIds
        ? userIds.split(',').map((id) => id.trim())
        : [];
      const bookIdsArray = bookIds
        ? bookIds.split(',').map((id) => id.trim())
        : [];

      const options: ExportOptions = {
        userIds: userIdsArray,
        bookIds: bookIdsArray,
      };

      const csv = await this.exportService.generateCsv(options);

      res.header('Content-Type', 'text/csv');
      res.attachment('export.csv');
      return res.send(csv);
    } catch (error) {
      console.log(`Erro ao gerar o CSV: ${error.message}`);
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}

export default ExportController;
