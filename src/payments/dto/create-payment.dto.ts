import { IsEmail, IsNumber, IsObject, IsString } from 'class-validator';
import { type Item } from 'src/types';

export class CreatePaymentDto {
  @IsString()
  token: string;

  @IsObject({ each: true })
  items: Item[];

  @IsEmail()
  email: string;

  @IsString()
  method: string;

  @IsString()
  type: string;

  @IsNumber()
  amount: number;

  @IsString()
  numbers: string;

  @IsString()
  paymentGateway?: string;
}
