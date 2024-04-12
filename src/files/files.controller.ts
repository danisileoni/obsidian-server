import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
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
    FileFieldsInterceptor([{ name: 'files', maxCount: 5 }], {
      fileFilter,
      limits: { fileSize: 2000 },
    }),
  )
  async uploadFileImage(
    @UploadedFile(ParseSharpPipe) file: Express.Multer.File,
  ): Promise<CloudinaryResponse> {
    return await this.cloudinaryService.uploadFile(file.buffer);
  }
}
