import { BadRequestException, Injectable } from '@nestjs/common';
import { type CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Buffer): Promise<CloudinaryResponse> {
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
  }
}
