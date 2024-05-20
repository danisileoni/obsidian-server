import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter } from 'src/common/helpers/fileFilter.helper';
import { ParseSharpPipe } from 'src/common/pipes/sharp-pipe.pipe';
import { type Product } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { type InfoProduct } from './entities/info-product.entity';
import { CreateInfoProductDto } from './dto/create-info-product.dto';
import { InfoProductsService } from './info-products.service';
import { UpdateInfoProductDto } from './dto/update-info-product.dto';
import { type ViewProduct } from 'src/types';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly infoProductsService: InfoProductsService,
  ) {}

  @Post('info-products/create')
  @UseInterceptors(
    FilesInterceptor('images', 6, {
      fileFilter,
    }),
  )
  async createInfoProduct(
    @UploadedFiles(ParseSharpPipe) images: Express.Multer.File[],
    @Body() createInfoProduct: CreateInfoProductDto,
  ): Promise<InfoProduct> {
    return await this.infoProductsService.create(createInfoProduct, images);
  }

  @Get('info-products')
  async findAllInfoProduct(): Promise<InfoProduct[]> {
    return await this.infoProductsService.findAll();
  }

  @Get('info-products/:term')
  async findOneInfoProduct(@Param('term') term: string): Promise<InfoProduct> {
    return await this.infoProductsService.findOne(term);
  }

  @Patch('info-products/:id')
  @UseInterceptors(
    FilesInterceptor('images', 6, {
      fileFilter,
    }),
  )
  async updateInfoProduct(
    @UploadedFiles(ParseSharpPipe) images: Express.Multer.File[],
    @Param('id') id: string,
    @Body() updateInfoProductDto: UpdateInfoProductDto,
  ): Promise<InfoProduct> {
    return await this.infoProductsService.update(
      id,
      images,
      updateInfoProductDto,
    );
  }

  @Delete('info-product/:id')
  async removeInfoProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return await this.infoProductsService.remove(id);
  }

  @Post('create/:idPlatform/:idInfo')
  async createProduct(
    @Param('idPlatform') idPlatform: string,
    @Param('idInfo') idInfo: string,
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return await this.productsService.create(
      createProductDto,
      idInfo,
      idPlatform,
    );
  }

  @Get()
  async findAllProduct(
    @Query() paginationDto: PaginationDto,
  ): Promise<ViewProduct> {
    return await this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  async findOneProduct(@Param('id') id: string): Promise<ViewProduct> {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateInfoProductDto: UpdateInfoProductDto,
  ): Promise<Product> {
    return await this.productsService.update(updateInfoProductDto, id);
  }

  @Delete(':id')
  async removeProduct(@Param('id') id: string): Promise<{ message: string }> {
    return await this.productsService.remove(id);
  }
}
