import { IsEmail, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsNumber()
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
  @IsIn(['PlayStation 4', 'PlayStation 5', 'Steam', 'PlayStation 3'])
  typeAccount: string;

  @IsString()
  password: string;
}
