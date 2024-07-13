import { IsArray, IsString } from 'class-validator';

export class SelectProductDto {
  @IsArray()
  @IsString({ each: true })
  productsId: string[];
}
