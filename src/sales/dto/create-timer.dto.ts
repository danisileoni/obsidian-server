import { IsString } from 'class-validator';

export class CreateTimerDto {
  @IsString()
  title: string;

  @IsString()
  endDate: Date;
}
