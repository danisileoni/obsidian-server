import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Sale } from 'src/sales/entities/sale.entity';
import { Platform } from 'src/platform/entities/platform.entity';
import { InfoProduct } from './entities/info-product.entity';
import { InfoProductsService } from './info-products.service';

@Module({
  controllers: [ProductsController],
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      Sale,
      Platform,
      InfoProduct,
    ]),
    CloudinaryModule,
  ],
  providers: [ProductsService, InfoProductsService],
  exports: [ProductsModule],
})
export class ProductsModule {}
