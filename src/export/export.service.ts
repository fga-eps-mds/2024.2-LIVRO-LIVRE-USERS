import { Injectable } from '@nestjs/common';
// import { BookService } from '../book/book.service'; 
import { parse } from 'json2csv';
import { UsersService } from 'src/users/users.service';

export interface ExportOptions {
    userIds?: string[];
    bookIds?: string[];
    authors?: string[];
    themes?: string[];
}

@Injectable()
export class ExportService {
    constructor(
        private readonly userService: UsersService,
        // private readonly bookService: BookService 
    ) { }

    async generateCsv(options: ExportOptions): Promise<string> {
        const { userIds, bookIds, authors, themes } = options;

        const users = userIds?.length ? await this.userService.findByIds(userIds) : [];

        /*
        const books = bookIds?.length || authors?.length || themes?.length
            ? this.mockFetchBooks(bookIds, authors, themes)
            : [];
        */

        // Dados a serem exportados - somente usuários neste momento
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
            // ...books.map((book) => ({
            //     type: 'Book',
            //     id: book.id,
            //     title: book.title,
            //     author: book.author,
            //     genre: book.theme,
            //     rating: book.rating,
            //     coverUrl: book.coverUrl,
            // })),
        ];

        const fields = [
            // { label: 'Tipo', value: 'type' },
            { label: 'ID', value: 'id' },
            { label: 'Nome', value: 'name' },
            { label: 'Sobrenome', value: 'lastName' },
            { label: 'Email', value: 'email' },
            { label: 'Telefone', value: 'phone' },
            { label: 'Criado em', value: 'createdAt' },
            { label: 'Atualizado em', value: 'updatedAt' },
        ];

        return parse(data, { fields });
    }

    /*
    private mockFetchBooks(bookIds?: string[], authors?: string[], themes?: string[]) {
        const allBooks = Array.from({ length: 30 }, (_, i) => ({
            id: `${i + 1}`,
            title: `Título ${i + 1}`,
            author: `Autor ${i + 1}`,
            theme: `Tema ${i + 1}`,
            rating: parseFloat((Math.random() * 5).toFixed(2)),
            coverUrl: 'capa.jpg',
        }));

        const filteredBooks = allBooks.filter((book) => {
            const matchesBookId = !bookIds || bookIds.includes(book.id);
            const matchesAuthor = !authors || authors.some(author =>
                book.author.toLowerCase() === author.trim().toLowerCase()
            );
            const matchesTheme = !themes || themes.some(theme =>
                book.theme.toLowerCase() === theme.trim().toLowerCase()
            );

            if (matchesBookId) {
                return matchesBookId;
            }
            if (matchesAuthor) {
                return matchesAuthor;
            }
            if (matchesTheme) {
                return matchesTheme;
            }
        });

        console.log('Livros filtrados:', filteredBooks);

        return filteredBooks;
    }
    */
}
