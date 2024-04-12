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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter } from 'src/common/helpers/fileFilter.helper';
import { ParseSharpPipe } from 'src/common/pipes/sharp-pipe.pipe';
import { type Product } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('images', 6, {
      fileFilter,
    }),
  )
  async create(
    @UploadedFiles(ParseSharpPipe) images: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return await this.productsService.create(createProductDto, images);
  }

  @Get()
  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    return await this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  async findOne(@Param('term') term: string): Promise<Product> {
    return await this.productsService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
