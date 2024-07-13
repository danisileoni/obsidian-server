import { IsEmail, IsLowercase, IsString } from 'class-validator';

export class LoginDashboardDto {
  @IsString()
  @IsLowercase()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
