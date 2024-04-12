import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  pricePrimary: number;

  @IsNumber()
  @IsOptional()
  priceSecondary: number;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsString({ each: true })
  tags: string[];
}
