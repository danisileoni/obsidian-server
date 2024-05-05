import { IsArray } from 'class-validator';
import { type ItemsDetails } from 'src/types';

export class CreateOrderDto {
  @IsArray()
  items: ItemsDetails[];
}
