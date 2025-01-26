import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KohaService } from './koha.service';
import { CreateKohaDto } from './dto/create-koha.dto';
import { UpdateKohaDto } from './dto/update-koha.dto';

@Controller('koha')
export class KohaController {
  constructor(private readonly kohaService: KohaService) {}

  @Post()
  create(@Body() createKohaDto: CreateKohaDto) {
    return this.kohaService.create(createKohaDto);
  }

  @Get()
  findAll() {
    return this.kohaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kohaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKohaDto: UpdateKohaDto) {
    return this.kohaService.update(+id, updateKohaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kohaService.remove(+id);
  }
}
