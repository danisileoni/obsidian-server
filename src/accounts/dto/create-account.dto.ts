import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAccountDto {
  @IsUUID()
  idProduct: string;

  @IsNumber()
  @IsOptional()
  quantityPrimary: number;

  @IsNumber()
  @IsOptional()
  quantitySecondary: number;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
