import {
  IsEmail,
  IsIn,
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
  @IsIn(['Play Station 4, Play Station 5', 'Steam'])
  typeAccount: string;

  @IsString()
  password: string;
}
