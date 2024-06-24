import {
  IsEmail,
  IsLowercase,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ValidateGoogleDto {
  @IsString()
  @MaxLength(21)
  name: string;

  @IsString()
  @MaxLength(16)
  @MinLength(6)
  @IsLowercase()
  username: string;

  @IsEmail()
  @IsString()
  @IsLowercase()
  email: string;

  password: string;
}
