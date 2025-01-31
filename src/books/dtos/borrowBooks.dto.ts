import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class BorrowBooksDto {
  id: number; 
  title: string;
  author: string;
  rating: number;
  description: string;
  coverImage: string;
  status: string;
}

