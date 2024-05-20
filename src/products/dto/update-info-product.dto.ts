import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateInfoProductDto } from './create-info-product.dto';

export class UpdateInfoProductDto extends PartialType(CreateInfoProductDto) {
  @IsOptional()
  @IsString()
  idImage?: number[];
}
