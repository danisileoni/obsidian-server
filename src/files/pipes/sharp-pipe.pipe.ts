import {
  Injectable,
  NotFoundException,
  type PipeTransform,
} from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ParseSharpPipe
  implements PipeTransform<Express.Multer.File, Promise<Buffer>>
{
  async transform(image: Express.Multer.File): Promise<Buffer> {
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const fileBuffer = await sharp(image.buffer).resize(400).webp().toBuffer();

    return fileBuffer;
  }
}
