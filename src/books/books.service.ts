import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../database/entities/book.entity';
import { SearchBooksDto } from './dtos/searchBooks.dto';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book)
        private booksRepository: Repository<Book>,
    ) { }

    async searchBooks(searchParams: SearchBooksDto) {
        let { title, author, theme, page, limit } = searchParams;

        page = parseInt(page as any, 10) || 1;  
        limit = parseInt(limit as any, 10) || 10;  
        const offset = (page - 1) * limit;

        const filters: any = {};
        if (title) filters.title = title;
        if (author) filters.author = author;
        if (theme) filters.theme = theme;

        try {
            const [books, totalBooks] = await this.booksRepository.findAndCount({
                where: filters,
                skip: offset,
                take: limit,
                order:{
                    averageRating : 'DESC',
                    title: 'ASC',
                }
            });

            const totalPages = Math.ceil(totalBooks / limit);

            if (books.length === 0) {
                return {
                    message: 'Nenhum livro encontrado para a pesquisa realizada. Tente outros termos.',
                    totalPages: 0,
                    currentPage: page,
                    results: [],
                };
            }

            return {
                message: 'Livros encontrados com sucesso!',
                totalPages,
                currentPage: page,
                results: books,
            };
        } catch (error) {
            console.error(error);
            throw new Error('Erro ao realizar a busca no banco de dados');
        }
    }
}
