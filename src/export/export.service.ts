import { Injectable } from '@nestjs/common';
import { parse } from 'json2csv';
import { UsersService } from '../users/users.service';
import { BooksService } from '../export/export.mockBooks';

export interface ExportOptions {
  userIds?: string[];
  bookIds?: string[];
}

@Injectable()
export class ExportService {
  constructor(
    private readonly userService: UsersService,
    private readonly booksService: BooksService,
  ) {}

  async generateCsv(options: ExportOptions): Promise<string> {
    try {
      const { userIds, bookIds } = options;

      if (
        (!userIds || userIds.length === 0) &&
        (!bookIds || bookIds.length === 0)
      ) {
        throw new Error(
          'Nenhum usuário ou livro encontrado para exportação. Verifique os IDs fornecidos.',
        );
      }

      const users =
        userIds && userIds.length
          ? await this.userService.findByIds(userIds)
          : [];
      const books =
        bookIds && bookIds.length
          ? await this.booksService.findBooksByIds(bookIds)
          : [];

      const foundUserIds = users.map((user) => user.id);
      const missingUserIds = userIds
        ? userIds.filter((id) => !foundUserIds.includes(id))
        : [];

      if (missingUserIds.length) {
        throw new Error(
          `Os seguintes IDs de usuários não foram encontrados no banco de dados: ${missingUserIds.join(', ')}`,
        );
      }

      const foundBookIds = books.map((book) => book.id);
      const missingBookIds = bookIds
        ? bookIds.filter((id) => !foundBookIds.includes(id))
        : [];

      if (missingBookIds.length) {
        throw new Error(
          `Os seguintes IDs de livros não foram encontrados no banco de dados: ${missingBookIds.join(', ')}`,
        );
      }

      const userData = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      const bookData = books.map((book) => ({
        id: book.id,
        titulo: book.titulo,
        autor: book.autor,
        tema: book.tema,
        rating: book.rating,
        imageUrl: book.imageUrl,
      }));

      const userFields = [
        { label: 'ID', value: 'id' },
        { label: 'Nome', value: 'name' },
        { label: 'Sobrenome', value: 'lastName' },
        { label: 'Email', value: 'email' },
        { label: 'Telefone', value: 'phone' },
        { label: 'Criado em', value: 'createdAt' },
        { label: 'Atualizado em', value: 'updatedAt' },
      ];

      const bookFields = [
        { label: 'ID', value: 'id' },
        { label: 'Titulo', value: 'titulo' },
        { label: 'Autor', value: 'autor' },
        { label: 'Tema', value: 'tema' },
        { label: 'Avaliacao', value: 'rating' },
        { label: 'Capa', value: 'imageUrl' },
      ];

      const csvData = [];

      if (userData.length) {
        csvData.push(parse(userData, { fields: userFields }));
      }

      if (bookData.length) {
        csvData.push(parse(bookData, { fields: bookFields }));
      }

      const csv = csvData.join('\n');

      return csv;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
