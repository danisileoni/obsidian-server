import { IsLowercase, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @MaxLength(16)
  @MinLength(6)
  @IsLowercase()
  username: string;

  @IsString()
  password: string;
}
