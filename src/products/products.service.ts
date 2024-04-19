import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreateProductDto } from './dto/create-product.dto';
import { type UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { type PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    fileImages: Express.Multer.File[],
  ): Promise<Product> {
    if (!fileImages) {
      throw new NotFoundException(
        'Images Not found, make sure you are loading the images',
      );
    }
    createProductDto.tags = (createProductDto.tags as unknown as string).split(
      ', ',
    );

    const resultImages = await Promise.all(
      fileImages.map(async (img) => {
        const file = await this.cloudinaryService.uploadFile(img.buffer);
        return file.secure_url;
      }),
    );

    try {
      const product = this.productRepository.create({
        ...createProductDto,
        images: resultImages.map((image) => {
          return this.productImageRepository.create({ url: image });
        }),
      });

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    if (!products) {
      throw new NotFoundException('Products not found, create a product');
    }

    return products;
  }

  async findOne(term: string): Promise<Product> {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      product = await this.productRepository.findOneBy({ slug: term });
    }

    if (!product) {
      throw new NotFoundException(`Product not found with id or slug: ${term}`);
    }

    return product;
  }

  async update(
    id: string,
    fileImages: Express.Multer.File[],
    updateProductDto: UpdateProductDto,
  ): Promise<object> {
    if (!isUUID(id)) {
      throw new BadRequestException('Has id validate');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const productUpdate = await this.productRepository.findOneBy({ id });

    if (!productUpdate) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }

    try {
      if (updateProductDto.tags) {
        updateProductDto.tags = (
          updateProductDto.tags as unknown as string
        ).split(', ');
      }

      // remove image
      if (updateProductDto.idImage) {
        updateProductDto.idImage = (
          updateProductDto.idImage as unknown as string
        )
          .split(', ')
          .map((num) => {
            return Number(num);
          });

        const { idImage } = updateProductDto;

        for (const idImg of idImage) {
          await queryRunner.manager.delete(ProductImage, { id: idImg });
          productUpdate.images = productUpdate.images.filter(
            (img) => img.id !== idImg,
          );
        }
      }

      // upload new images
      if (fileImages) {
        const resultImages = await Promise.all(
          fileImages.map(async (img) => {
            const file = await this.cloudinaryService.uploadFile(img.buffer);
            return file.secure_url;
          }),
        );

        productUpdate.images = [
          ...productUpdate.images,
          ...resultImages.map((img) =>
            this.productImageRepository.create({ url: img }),
          ),
        ];
      }

      // Update Product with assign
      Object.assign(productUpdate, updateProductDto);

      await queryRunner.manager.save(productUpdate);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // update
      return await this.productRepository.findOneBy({ id });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string): Promise<object> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }

    try {
      await this.productRepository.remove(product);

      return {
        ok: true,
        message: 'The product is remove success',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check the server logs');
    }
  }
}
