import { Controller, Get, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { SearchBooksDto } from './dtos/searchBooks.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('search')
  async searchBooks(@Query() searchParams: SearchBooksDto) {
    return this.booksService.searchBooks(searchParams);
  }
}
