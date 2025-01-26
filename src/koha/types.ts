export interface SignUpParams {
  username: string;
  password: string;
}

export interface BookParams {
  searchQuery?: string;
}

export interface KohaApi {
  user: {
    signUp(params: SignUpParams): Promise<{ status: number }>;
  };
  books: {
    search(params?: BookParams): Array<any>;
  };
}
