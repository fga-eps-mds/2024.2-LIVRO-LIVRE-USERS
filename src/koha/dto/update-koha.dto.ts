import { PartialType } from '@nestjs/mapped-types';
import { CreateKohaDto } from './create-koha.dto';

export class UpdateKohaDto extends PartialType(CreateKohaDto) {
  surname: string;
  email: string;
  phone: string;
  library_id: string;
  category_id: string;
}
