import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExportService, ExportOptions } from './export.service';
import { Response } from 'express';

@Controller('export')
export class ExportController {
    constructor(private readonly exportService: ExportService) {}

    @Get()
    async exportToCsv(
        @Query('userIds') userIds: string,
        @Res() res: Response,
        @Query('userName') userName?: string,
        @Query('bookIds') bookIds?: string,
        @Query('authors') authors?: string,
        @Query('themes') themes?: string,
    ) {
        try {
            const userIdsArray = userIds ? userIds.split(',') : [];
            const bookIdsArray = bookIds ? bookIds.split(',') : [];
            const authorsArray = authors ? authors.split(',') : [];
            const themesArray = themes ? themes.split(',') : [];

            const options: ExportOptions = {
                userIds: userIdsArray,
                bookIds: bookIdsArray,
                authors: authorsArray,
                themes: themesArray,
            };

            const csv = await this.exportService.generateCsv(options);

            res.header('Content-Type', 'text/csv');
            res.attachment('export.csv');
            res.send(csv);
        } catch (error) {
            console.error('Erro ao gerar o arquivo:', error);

            res.status(500).json({
                message: 'Erro ao gerar o arquivo CSV. Tente novamente mais tarde.',
            });
        }
    }
}
