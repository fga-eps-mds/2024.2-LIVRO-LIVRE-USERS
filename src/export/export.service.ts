import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'json2csv';
import { UsersService } from '../users/users.service';

export interface ExportOptions {
    userIds?: string[];
    bookIds?: string[];
    authors?: string[];
    themes?: string[];
}

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);

    constructor(private readonly userService: UsersService) {}

    async generateCsv(options: ExportOptions): Promise<string> {
        try {
            const { userIds, bookIds, authors, themes } = options;

            const users = userIds?.length ? await this.userService.findByIds(userIds) : [];

            const data = [
                ...users.map((user) => ({
                    type: 'User',
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                })),
            ];

            if (!data.length) {
                this.logger.warn('Nenhum dado encontrado para exportação.');
                throw new Error('Nenhum dado encontrado para exportação.');
            }

            // Campos do CSV
            const fields = [
                { label: 'ID', value: 'id' },
                { label: 'Nome', value: 'name' },
                { label: 'Sobrenome', value: 'lastName' },
                { label: 'Email', value: 'email' },
                { label: 'Telefone', value: 'phone' },
                { label: 'Criado em', value: 'createdAt' },
                { label: 'Atualizado em', value: 'updatedAt' },
            ];

            this.logger.log('Iniciando geração do CSV...');
            const csv = parse(data, { fields });
            this.logger.log('CSV gerado com sucesso.');

            return csv;
        } catch (error) {
            this.logger.error('Erro ao gerar o CSV:', error);
            throw new Error('Erro ao gerar o arquivo CSV. Verifique os dados fornecidos.');
        }
    }
}
