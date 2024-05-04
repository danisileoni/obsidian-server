import { IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString({ each: true })
  idsProducts: string[];
}
