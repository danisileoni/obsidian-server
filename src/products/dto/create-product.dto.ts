import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @Type(() => Number)
  pricePrimary: number;

  @IsOptional()
  @Type(() => Number)
  priceSecondary: number;

  @IsOptional()
  @Type(() => Number)
  price: number;
}
