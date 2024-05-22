import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [FilesController],
  providers: [],
  imports: [CloudinaryModule],
})
export class FilesModule {}
