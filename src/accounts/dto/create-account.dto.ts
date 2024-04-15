import { IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateAccountDto {
  @IsUUID()
  idProduct: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
