import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class BorrowBooksDto {
  @IsString()
  @IsNotEmpty()
  id: string;

}
