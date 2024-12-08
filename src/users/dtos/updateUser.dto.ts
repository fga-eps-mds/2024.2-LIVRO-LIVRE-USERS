import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  oldPassword?: string;
  newPassword?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
