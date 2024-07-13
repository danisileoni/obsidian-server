import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  token: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  numbers: string;

  @IsString()
  paymentGateway: string;
}
