import { Controller, Get, Param, Query, Put, Body } from '@nestjs/common';
import { BooksService } from './books.service';
import { SearchBooksDto } from './dtos/searchBooks.dto';
import { BorrowBooksDto } from './dtos/borrowBooks.dto';
import { UpdateBookStatusDto } from './dtos/updateBookStatus.dto'; // Certifique-se de importar esse DTO

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
      return await this.booksService.getBookById(id);
    } catch (error) {
      throw error; 
    }
  }

  
  @Put(':id/status')
  async updateBookStatus(@Param('id') id: string, @Body() updateBookStatusDto: UpdateBookStatusDto) {
    return this.booksService.updateBookStatus(id, updateBookStatusDto);
  }
}
