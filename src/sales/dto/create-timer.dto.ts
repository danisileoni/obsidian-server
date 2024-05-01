import { IsString } from 'class-validator';

export class CreateTimerDto {
  @IsString()
  endDate: Date;
}
