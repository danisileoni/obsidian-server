import { IsString } from 'class-validator';

export class CreateInfoProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  tags: string[];
}
