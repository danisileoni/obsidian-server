import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class FilterUserDto extends PartialType(PaginationDto) {
  @IsOptional()
  @IsString()
  search: string;
}
