import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserRoles } from '../../database/entities/user.entity';

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  role: UserRoles;

  keepLoggedIn?: boolean; 
}
