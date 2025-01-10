import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class ListUsersQueryDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  phone?: string;

  @IsNotEmpty()
  perPage: number;

  @IsNotEmpty()
  page: number;
}
