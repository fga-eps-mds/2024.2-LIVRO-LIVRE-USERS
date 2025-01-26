import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportOptions } from './export.service';
import { Response } from 'express';

@Controller('export')
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Get()
    async exportToCsv(
        @Query('userIds') userIds: string,
        //? parametros ainda nao usados
        @Query('userName') userName: string, 
        @Query('bookIds') bookIds: string, 
        @Query('authors') authors: string, 
        @Query('themes') themes: string, 
        @Res() res: Response
    ) {
        try {
            const userIdsArray = userIds ? userIds.split(',') : [];
            // Os parâmetros de livros não estão sendo utilizados por enquanto
            // const bookIdsArray = bookIds ? bookIds.split(',') : [];
            // const authorsArray = authors ? authors.split(',') : [];
            // const themesArray = themes ? themes.split(',') : [];

            // Passando somente os parâmetros relacionados aos usuários
            const options: ExportOptions = {
                userIds: userIdsArray,
                // bookIds: bookIdsArray,
                // authors: authorsArray,
                // themes: themesArray,
            };

            // Gerar o CSV com dados dos usuários
            const csv = await this.exportService.generateCsv(options);

            // Responder com o arquivo gerado
            res.header('Content-Type', 'text/csv');
            res.attachment('export.csv');
            res.send(csv);

        } catch (error) {
            // Responder com erro caso algo dê errado
            console.error('Erro ao gerar o arquivo:', error);
            res.status(500).json({
                message: 'Erro ao gerar o arquivo CSV. Tente novamente mais tarde.',
            });
        }
    }
}
