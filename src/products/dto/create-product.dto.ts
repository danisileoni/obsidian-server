import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @Type(() => Number)
  pricePrimary: number;

  @IsOptional()
  @Type(() => Number)
  priceSecondary: number;

  @IsOptional()
  @Type(() => Number)
  price: number;

  @IsString()
  @Expose({ name: 'tags' })
  tags: string[];

  @Expose({ name: 'tags' })
  getTags(): string[] {
    return (this.tags as unknown as string).split(', ');
  }
}
