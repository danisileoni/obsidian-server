import {
  IsLowercase,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @IsString()
  @MaxLength(16)
  @MinLength(6)
  @IsLowercase()
  username: string;

  @IsString()
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  @MinLength(8)
  @MaxLength(21)
  password: string;
}
