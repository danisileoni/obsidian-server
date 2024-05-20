import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InfoProduct } from './entities/info-product.entity';
import { DataSource, Repository } from 'typeorm';
import { ProductImage } from './entities';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { type CreateInfoProductDto } from './dto/create-info-product.dto';
import { isUUID } from 'class-validator';
import { type UpdateInfoProductDto } from './dto/update-info-product.dto';

@Injectable()
export class InfoProductsService {
  constructor(
    @InjectRepository(InfoProduct)
    private readonly infoProductRepository: Repository<InfoProduct>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createInfoProductDto: CreateInfoProductDto,
    fileImages: Express.Multer.File[],
  ): Promise<InfoProduct> {
    if (!fileImages) {
      throw new NotFoundException(
        'Images Not found, make sure you are loading the images',
      );
    }

    createInfoProductDto.tags = (
      createInfoProductDto.tags as unknown as string
    ).split(', ');

    const resultImages = await Promise.all(
      fileImages.map(async (img) => {
        const file = await this.cloudinaryService.uploadFile(img.buffer);
        return file.secure_url;
      }),
    );

    try {
      const infoProduct = this.infoProductRepository.create({
        ...createInfoProductDto,
        images: resultImages.map((image) => {
          return this.productImageRepository.create({ url: image });
        }),
      });

      await this.infoProductRepository.save(infoProduct);

      return infoProduct;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    }
  }

  async findAll(): Promise<InfoProduct[]> {
    const infoProducts = await this.infoProductRepository.find();

    if (infoProducts.length < 0) {
      throw new NotFoundException('info products not found');
    }

    return infoProducts;
  }

  async findOne(term: string): Promise<InfoProduct> {
    let infoProduct: InfoProduct;

    if (isUUID(term)) {
      infoProduct = await this.infoProductRepository.findOneBy({
        id: term,
      });
    } else {
      infoProduct = await this.infoProductRepository.findOneBy({ slug: term });
    }

    if (!infoProduct) {
      throw new NotFoundException(
        `Info product not found with id or slug: ${term}`,
      );
    }

    return infoProduct;
  }

  async update(
    id: string,
    fileImages: Express.Multer.File[],
    updateInfoProductDto: UpdateInfoProductDto,
  ): Promise<InfoProduct> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const infoProduct = await this.infoProductRepository.findOneBy({ id });

    if (!infoProduct) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }

    try {
      if (updateInfoProductDto.tags) {
        updateInfoProductDto.tags = (
          updateInfoProductDto.tags as unknown as string
        ).split(', ');
      }

      // remove images
      if (updateInfoProductDto.idImage) {
        updateInfoProductDto.idImage = (
          updateInfoProductDto.idImage as unknown as string
        )
          .split(', ')
          .map((num) => {
            return Number(num);
          });

        const { idImage } = updateInfoProductDto;

        for (const idImg of idImage) {
          await queryRunner.manager.delete(ProductImage, { id: idImg });
          infoProduct.images = infoProduct.images.filter(
            (img) => img.id !== idImg,
          );
        }
      }

      // upload image
      if (fileImages) {
        const resultImages = await Promise.all(
          fileImages.map(async (img) => {
            const file = await this.cloudinaryService.uploadFile(img.buffer);
            return file.secure_url;
          }),
        );

        infoProduct.images = [
          ...infoProduct.images,
          ...resultImages.map((img) =>
            this.productImageRepository.create({ url: img }),
          ),
        ];
      }

      Object.assign(infoProduct, updateInfoProductDto);

      await queryRunner.manager.save(infoProduct);
      await queryRunner.commitTransaction();

      return await this.infoProductRepository.findOneBy({ id });
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Check logs server');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.infoProductRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }

    try {
      await this.infoProductRepository.remove(product);

      return {
        message: 'The product is remove success',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check the server logs');
    }
  }
}
