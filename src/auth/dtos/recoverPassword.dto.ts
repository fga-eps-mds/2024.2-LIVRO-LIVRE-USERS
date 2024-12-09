import { IsNotEmpty } from 'class-validator';

export class RecoverPasswordDto {
  @IsNotEmpty()
  email: string;
}
