import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Sale } from 'src/sales/entities/sale.entity';

@Module({
  controllers: [ProductsController],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, Sale]),
    CloudinaryModule,
  ],
  providers: [ProductsService],
  exports: [ProductsModule],
})
export class ProductsModule {}
