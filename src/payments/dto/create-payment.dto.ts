import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  token: string;

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
  paymentGateway: string;
}
