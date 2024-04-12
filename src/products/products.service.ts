import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreateProductDto } from './dto/create-product.dto';
import { type UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { Repository } from 'typeorm';
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
    const { limit, offset } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    if (products) {
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

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
