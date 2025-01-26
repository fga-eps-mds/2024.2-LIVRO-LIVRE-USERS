import { PartialType } from '@nestjs/mapped-types';
import { CreateKohaDto } from './create-koha.dto';

export class UpdateKohaDto extends PartialType(CreateKohaDto) {}
