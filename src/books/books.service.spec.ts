import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { NotFoundException } from '@nestjs/common';
import { isString } from 'class-validator';

describe('BooksService', () => {
  let booksService: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksService],
    }).compile();

    booksService = module.get<BooksService>(BooksService);
  });

  it('deve buscar um livro por ID existente', async () => {
    const result = await booksService.getBookById('1');
    expect(result).toBeDefined();
    expect(result.id).toBe(1);
  });

  it('deve lançar erro ao buscar um livro por ID inexistente', async () => {
    await expect(booksService.getBookById('999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve atualizar o status de um livro existente', async () => {
    const updatedBook = await booksService.updateBookStatus('1', {
      status: 'NotAvailable',
      userId: '',
      date: '',
    });
    expect(updatedBook.status).toBe('NotAvailable');
  });

  it('deve lançar erro ao tentar atualizar o status de um livro inexistente', async () => {
    await expect(
      booksService.updateBookStatus('999', {
        status: 'NotAvailable',
        userId: '',
        date: '',

      }),
    ).rejects.toThrow(NotFoundException);
  });
});
