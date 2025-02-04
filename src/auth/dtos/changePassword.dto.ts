import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 128, { message: 'A nova senha deve ter entre 8 e 128 caracteres.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/, {
    message:
      'A nova senha deve conter pelo menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial.',
  })

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}