import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpException,
    HttpStatus,
    NotFoundException,
    ValidationPipe,
    UsePipes
  } from '@nestjs/common';
  import { LivrosService } from './livro.service';
  import { Livro } from './entities/livro.entity';
  import { CreateLivroDto } from './dto/create-livro.dto'
  import { UpdateLivroDto } from './dto/update-livro.dto';
  @Controller('livros')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) 
  export class LivrosController {
    constructor(private readonly livrosService: LivrosService) {}
  
    @Get()
    async findAll(): Promise<Livro[]> {
      return this.livrosService.buscarLivros();
    }
  
    @Get('buscar')
    async buscarlivros(
      @Query('titulo') titulo: string,
      @Query('autor') autor: string,
    ) {
      try {
        const livros = await this.livrosService.buscarLivros(titulo, autor);
        return livros;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Livro> {
      const livro = await this.livrosService.buscarLivroPorId(id);
      if (!livro) {
        throw new NotFoundException(`Livro com ID ${id} não encontrado`);
      }
      return livro;
    }
  
    @Post()
    async create(@Body() createLivroDto: CreateLivroDto): Promise<Livro> {
        try {
            return await this.livrosService.criarLivro(createLivroDto);
        } catch (error) {
          // Trata erros de validação (do TypeORM) e outros erros
            if (error.name === 'QueryFailedError') {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Erro ao criar livro', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
  
    @Put(':id')
    async update(
      @Param('id') id: string,
      @Body() updateLivroDto: UpdateLivroDto,
    ): Promise<Livro> {
      try {
          const livro = await this.livrosService.atualizarLivro(id, updateLivroDto);
          if (!livro) {
              throw new NotFoundException(`Livro com ID ${id} não encontrado`);
          }
          return livro;
      } catch (error) {
          if (error instanceof NotFoundException) { // Trata NotFoundException do serviço
            throw error;
          }
          // Trata erros de validação (do TypeORM) e outros erros
          if (error.name === 'QueryFailedError') {
              throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
          }
          throw new HttpException('Erro ao atualizar livro', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        const result = await this.livrosService.removerLivro(id);
        if (result.affected === 0) { // Verifica se algo foi deletado
            throw new NotFoundException(`Livro com ID ${id} não encontrado`);
        }
    }
  }