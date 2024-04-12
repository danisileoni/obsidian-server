import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { type CloudinaryResponse } from 'src/cloudinary/cloudinary-response';
import { ParseSharpPipe } from './pipes/sharp-pipe.pipe';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('product')
  @UseInterceptors(
    FilesInterceptor('files', 6, {
      fileFilter,
    }),
  )
  async uploadFileImage(
    @UploadedFiles(ParseSharpPipe) files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    const resultFiles = await Promise.all(
      files.map(async (img) => {
        return await this.cloudinaryService.uploadFile(img.buffer);
      }),
    );

    return resultFiles;
  }
}
