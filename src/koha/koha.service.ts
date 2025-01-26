import { Injectable } from '@nestjs/common';
import { CreateKohaDto } from './dto/create-koha.dto';
import { UpdateKohaDto } from './dto/update-koha.dto';

@Injectable()
export class KohaService {
  create(createKohaDto: CreateKohaDto) {
    return 'This action adds a new koha';
  }

  findAll() {
    return `This action returns all koha`;
  }

  findOne(id: number) {
    return `This action returns a #${id} koha`;
  }

  update(id: number, updateKohaDto: UpdateKohaDto) {
    return `This action updates a #${id} koha`;
  }

  remove(id: number) {
    return `This action removes a #${id} koha`;
  }
}
