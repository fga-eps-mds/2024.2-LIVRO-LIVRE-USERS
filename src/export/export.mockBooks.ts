import { Injectable } from '@nestjs/common';

export interface Book {
    id: string;
    titulo: string;
    autor: string;
    tema: string;
    rating: number;
    imageUrl: string;
}

@Injectable()
export class BooksService {
    private books: Book[] = Array.from({ length: 120 }, (_, i) => ({
        id: `${i + 1}`,
        titulo: `Título ${Math.floor(i / 2) + 1}`,
        autor: `Autor ${i % 28 + 1}`,
        tema: `Tema ${i + 1}`,
        rating: parseFloat((Math.random() * 5).toFixed(2)),
        imageUrl: 'https://plus.unsplash.com/premium_photo-1682125773446-259ce64f9dd7?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    }));

    async findBooksByIds(bookIds: string[]): Promise<Book[]> {
        return this.books.filter(book => bookIds.includes(book.id));
    }
}
