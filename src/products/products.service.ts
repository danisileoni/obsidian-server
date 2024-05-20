import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './entities';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InfoProduct } from './entities/info-product.entity';
import { type CreateProductDto } from './dto/create-product.dto';
import { Platform } from 'src/platform/entities/platform.entity';
import { type PaginationDto } from '../common/dtos/pagination.dto';
import { type ViewProduct } from 'src/types';
import { type UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(InfoProduct)
    private readonly infoProductRepository: Repository<InfoProduct>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    idInfo: string,
    idPlatform: string,
  ): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const infoProduct = await this.infoProductRepository.findOneBy({
      id: idInfo,
    });

    if (!infoProduct) {
      throw new NotFoundException(`Info product not found with id: ${idInfo}`);
    }

    const platform = await this.platformRepository.findOneBy({
      id: idPlatform,
    });

    if (!platform) {
      throw new NotFoundException(`Platform not found with id: ${idInfo}`);
    }

    const product = this.productRepository.create({
      infoProduct,
      platform,
      ...createProductDto,
    });

    try {
      await queryRunner.manager.save(product);
      await queryRunner.query('REFRESH MATERIALIZED view product_materialized');

      await queryRunner.commitTransaction();

      return product;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Check logs server');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<ViewProduct> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const { limit, offset } = paginationDto;

    try {
      const products = await queryRunner.query(`
        SELECT * FROM product_materialized
        OFFSET ${offset}
        LIMIT ${limit}
      `);

      return products;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string): Promise<ViewProduct> {
    let product: ViewProduct;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      product = await queryRunner.query(
        `
        SELECT * FROM product_materialized
        WHERE product_materialized.product_id = ${id}
        `,
      );

      product = product[0];

      if (!product) {
        throw new NotFoundException();
      }

      return product;
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Product not found with id: ${id}`);
      }
      console.log(error);
      throw new InternalServerErrorException('Check log server');
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    updateProductDto: UpdateProductDto,
    id: string,
  ): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const product = await this.productRepository.preload({
        id,
        ...updateProductDto,
      });

      if (!product) {
        throw new NotFoundException();
      }

      await this.productRepository.save(product);

      await queryRunner.query('REFRESH MATERIALIZED view product_materialized');

      return product;
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Product not found with id: ${id}`);
      }
      console.log(error);
      throw new InternalServerErrorException('Check server error');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }

    try {
      await this.productRepository.save(product);
      await queryRunner.query('REFRESH MATERIALIZED view product_materialized');

      return {
        message: `Success remove product with id: ${id}`,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check log server');
    }
  }
}
