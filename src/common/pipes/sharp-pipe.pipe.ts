import {
  Injectable,
  NotFoundException,
  type PipeTransform,
} from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ParseSharpPipe
  implements PipeTransform<Express.Multer.File[], Promise<Buffer[]>>
{
  async transform(images: Express.Multer.File[]): Promise<Buffer[]> {
    if (!images) {
      throw new NotFoundException('Image not found');
    }
    const filesBuffers = await Promise.all(
      images.map(async (img) => {
        return await sharp(img.buffer).resize(400).webp().toBuffer();
      }),
    );

    return filesBuffers;
  }
}
