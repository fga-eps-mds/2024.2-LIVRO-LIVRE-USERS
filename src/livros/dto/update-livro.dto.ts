import { PartialType } from '@nestjs/mapped-types'; 
import { CreateLivroDto } from './create-livro.dto';

export class UpdateLivroDto extends PartialType(CreateLivroDto) {
   
        titulo?: string;
        autor?: string;
        anoPublicacao?: number;
        editora?: string;
        genero?: string;
        preco?: number;
        descricao?: string
    }
