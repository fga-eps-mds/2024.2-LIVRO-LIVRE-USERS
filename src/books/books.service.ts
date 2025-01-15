import { Injectable } from '@nestjs/common';
import { SearchBooksDto } from './dtos/searchBooks.dto';

@Injectable()
export class BooksService {
    async searchBooks(searchParams: SearchBooksDto) {
        const { title, author, theme, page, limit } = searchParams;
        const offset = (page - 1) * limit;

        const filters: any = {};
        /* Filtros Exemplo em MondoDb
        if (title) filters.title = { $regex: new RegExp(title, 'i') }; 
        if (author) filters.author = { $regex: new RegExp(author, 'i') };
        if (theme) filters.theme = { $regex: new RegExp(theme, 'i') };
        */

        const results = [];
        const totalResults = 0;
        if (results.length === 0) {
            return {
                message: 'Nenhum livro encontrado para a pesquisa realizada. Tente outros termos.',
                totalPages: 0,
                currentPage: page,
                results: [],
            };
        }
        
    }
}