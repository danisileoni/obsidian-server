import { IsEmail, IsString } from 'class-validator';

export class SendForgotPasswordDto {
  @IsString()
  @IsEmail()
  email: string;
}
