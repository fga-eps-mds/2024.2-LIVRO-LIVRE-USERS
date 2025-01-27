export class findUserBooksQueryDto {
    userId: string; // ID do usuário que está buscando o histórico de livros
    perPage?: number; // Quantidade de livros por página, opcional, pode ser um valor como 10, 20, etc.
    page?: number; // Número da página que o usuário quer visualizar, opcional, padrão seria 1
  }
  