import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SignUpParams, KohaApi } from './types';

@Injectable()
export class KohaApiFactory {
  private readonly books = [
    {
      id: 1,
      name: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      publisher: "Charles Scribner's Sons",
      year: '1925',
      cover:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/TheGreatGatsby_1925jacket.jpeg/220px-TheGreatGatsby_1925jacket.jpeg',
    },
  ];

  private readonly api = axios.create({
    auth: {
      username: 'admin',
      password: 'admin',
    },
  });

  public create(): KohaApi {
    return {
      user: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        signUp: async (params: SignUpParams) => {
          return new Promise((resolve) =>
            setTimeout(() => resolve({ status: 200 }), 1000),
          );
        },
      },
      books: {
        search: () =>
          new Array(8).fill(1).map((_, i) => ({
            ...this.books[0],
            name: `${this.books[0].name} ${i + 1}`,
            id: i + 1,
          })),
      },
    };
  }
}
