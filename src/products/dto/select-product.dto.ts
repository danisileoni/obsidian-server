import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class SelectProductDto {
  @Transform(
    ({ value }: { value: string }) => {
      return value.split(',');
    },
    { toClassOnly: true },
  )
  @IsArray()
  @IsString({ each: true })
  productsId: string[];
}
