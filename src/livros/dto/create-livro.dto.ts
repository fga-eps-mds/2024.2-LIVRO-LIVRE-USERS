import { IsString, IsNotEmpty, IsOptional, Min, Max, IsInt } from 'class-validator';

export class CreateLivroDto {
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsNotEmpty()
    autor: string;

    @IsInt()
    @IsOptional()
    @Min(0)  
    @Max(new Date().getFullYear()) 
    anoPublicacao?: number; 

    @IsString()
    @IsOptional()
    editora?: string; 

    @IsString()
    @IsOptional()
    genero?: string;   

    preco?: number;
    descricao?: string
 

}