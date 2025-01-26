import { Inject, Injectable } from '@nestjs/common';
import { CreateKohaDto } from './dto/create-koha.dto';
import { UpdateKohaDto } from './dto/update-koha.dto';
import { KohaApi } from './types';

@Injectable()
export class KohaService {
  constructor(@Inject('KOHA_API') private readonly kohaApi: KohaApi) {}

  async singUpUser(username: string, password: string) {
    // fazer trys e lidar com os erros de acordo com a documentação
    return await this.kohaApi.user.signUp({ username, password });
  }

  getBooks() {
    return this.kohaApi.books.search();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createKohaDto: CreateKohaDto) {
    return 'This action adds a new koha';
  }

  findAll() {
    return `This action returns all koha`;
  }

  findOne(id: number) {
    return `This action returns a #${id} koha`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateKohaDto: UpdateKohaDto) {
    return `This action updates a #${id} koha`;
  }

  remove(id: number) {
    return `This action removes a #${id} koha`;
  }
}
