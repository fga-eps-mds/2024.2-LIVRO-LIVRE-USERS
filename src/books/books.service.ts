import { Injectable, NotFoundException } from '@nestjs/common';
import { BorrowBooksDto } from './dtos/borrowBooks.dto';
import { SearchBooksDto } from './dtos/searchBooks.dto';
import { UpdateBookStatusDto } from './dtos/updateBookStatus.dto';
import { booksMock } from './books.mock'; // 🔥 Importando o mock

@Injectable()
export class BooksService {
  private books = booksMock; // Usando o mock

  async searchBooks(searchParams: SearchBooksDto) {
    return this.books.filter(book => 
      (searchParams.title ? book.title.includes(searchParams.title) : true) &&
      (searchParams.author ? book.author.includes(searchParams.author) : true)
    );
  }

  async getBookById(id: string): Promise<BorrowBooksDto> {
    const book = this.books.find(book => book.id === Number(id));
    if (!book) {
      throw new NotFoundException("Livro não encontrado");
    }
    return book;
  }

  async updateBookStatus(id: string, updateBookStatusDto: UpdateBookStatusDto): Promise<BorrowBooksDto> {
    const bookIndex = this.books.findIndex((book) => book.id === Number(id));

    if (bookIndex === -1) {
      throw new NotFoundException('Livro não encontrado');
    }

    this.books[bookIndex].status = updateBookStatusDto.status;
    return this.books[bookIndex];
  }
}
