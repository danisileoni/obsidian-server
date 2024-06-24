import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PartialType } from '@nestjs/mapped-types';

export class FilterProductDto extends PartialType(PaginationDto) {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  sale?: boolean;

  @IsOptional()
  @IsString()
  platform: string;

  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((tag) => tag.trim());
    }
    return value;
  })
  tags: string[];

  @IsOptional()
  @IsString()
  search: string;
}
