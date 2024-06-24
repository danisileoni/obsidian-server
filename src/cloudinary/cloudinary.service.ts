import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Buffer): Promise<CloudinaryResponse> {
    if (!file) {
      throw new NotFoundException('Images Not found');
    }

    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'products',
            public_id: uuid(),
          },
          (error, result) => {
            if (error) {
              reject(error);
              throw new BadRequestException('Error uploading file');
            } else {
              resolve(result);
            }
          },
        );
        Readable.from(Buffer.from(file)).pipe(uploadStream);
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error uploading file | Check logs server',
      );
    }
  }
}
