import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  token: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  email: string;

  @IsString()
  method: string;

  @IsNumber()
  quantity: number;

  @IsString()
  type: string;

  @IsString()
  numbers: string;

  @IsString()
  paymentGateway?: string;
}
