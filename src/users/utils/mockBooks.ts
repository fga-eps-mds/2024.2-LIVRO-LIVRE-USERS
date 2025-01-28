export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
}

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    publishedYear: 1925,
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0446310789',
    publishedYear: 1960,
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    publishedYear: 1949,
  },
];
