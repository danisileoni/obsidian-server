import { IsString } from 'class-validator';

export class CreatePlatformDto {
  @IsString()
  namePlatform: string;
}
