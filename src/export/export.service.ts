import { Injectable } from '@nestjs/common';
import { parse } from 'json2csv';
import { UsersService } from '../users/users.service';

export interface ExportOptions {
  userIds: string[];
}

@Injectable()
export class ExportService {
  constructor(private readonly userService: UsersService) {}

  async generateCsv(options: ExportOptions): Promise<string> {
    try {
      const { userIds } = options;

      if (!userIds || userIds.length === 0) {
        console.log('Nenhum usuário encontrado.');
        throw new Error('Nenhum usuário encontrado para exportação. Verifique os IDs fornecidos.');
      }

      const users = userIds.length ? await this.userService.findByIds(userIds) : [];

      const foundIds = users.map((user) => user.id);
      const missingIds = userIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length) {
        console.log(`IDs não encontrados: ${missingIds}`);
        throw new Error(`Os seguintes IDs não foram encontrados no banco de dados: ${missingIds.join(', ')}`);
      }

      const data = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      const fields = [
        { label: 'ID', value: 'id' },
        { label: 'Nome', value: 'name' },
        { label: 'Sobrenome', value: 'lastName' },
        { label: 'Email', value: 'email' },
        { label: 'Telefone', value: 'phone' },
        { label: 'Criado em', value: 'createdAt' },
        { label: 'Atualizado em', value: 'updatedAt' },
      ];

      console.log(`Gerando CSV para ${userIds.length} usuários.`);
      const csv = parse(data, { fields });
      console.log('CSV gerado com sucesso.');

      return csv;
    } catch (error) {
      console.log(`Erro ao gerar o CSV: ${error.message}`);
      throw new Error(error.message);
    }
  }
}
