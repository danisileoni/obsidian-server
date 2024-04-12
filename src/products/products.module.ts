import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [ProductsController],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    CloudinaryModule,
  ],
  providers: [ProductsService],
})
export class ProductsModule {}
