import { Controller, Get, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { SearchBooksDto } from './dtos/searchBooks.dto';
import { BorrowBooksDto } from './dtos/borrowBooks.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('search')
  async searchBooks(@Query() searchParams: SearchBooksDto) {
    return this.booksService.searchBooks(searchParams);
  }
  
  @Get(':id')
  async getBookById(@Param('id') id: string): Promise<BorrowBooksDto> {
    try {
      // Chama o serviço para buscar os detalhes do livro
      return await this.booksService.getBookById(id);
    } catch (error) {
      // Se necessário, você pode personalizar o tratamento de erros aqui
      throw error;
      
  }
}
}