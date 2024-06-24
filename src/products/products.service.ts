/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './entities';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InfoProduct } from './entities/info-product.entity';
import { type CreateProductDto } from './dto/create-product.dto';
import { Platform } from 'src/platform/entities/platform.entity';
import { type UpdateProductDto } from './dto/update-product.dto';
import { type FilterProductDto } from './dto/filters-product.dto';
import { type AllProducts } from 'src/types';
import { type SelectProductDto } from './dto/select-product.dto';
import { type PaginationDto } from 'src/common/dtos/pagination.dto';

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

  async findSelectedProducts(
    selectProductDto: SelectProductDto,
  ): Promise<InfoProduct[]> {
    const { productsId } = selectProductDto;
    console.log(productsId);

    const products = await this.infoProductRepository.find({
      relations: { product: { platform: true }, images: true },
      where: {
        product: {
          id: In(productsId),
        },
      },
    });

    return products;
  }

  async findAll(filterProductDto: FilterProductDto): Promise<AllProducts> {
    const {
      platform,
      tags = [],
      maxPrice,
      minPrice,
      sale,
      limit,
      offset,
      search,
    } = filterProductDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const productConditions: string[] = [];
    const materializedConditions: string[] = [];
    const parameters: any[] = [];

    if (sale) {
      productConditions.push(`product->'sale'->>'sale' IS NOT null`);
    }
    if (minPrice) {
      productConditions.push(`(
        COALESCE(product->>'price')::NUMERIC >= $${parameters.length + 1}
        OR COALESCE(product->>'pricePrimary')::NUMERIC >= $${parameters.length + 1}
        OR COALESCE(product->>'priceSecondary')::NUMERIC >= $${parameters.length + 1}
      )`);
      parameters.push(+minPrice);
    }
    if (maxPrice) {
      productConditions.push(`(
        COALESCE(product->>'price')::NUMERIC <= $${parameters.length + 1}
        OR COALESCE(product->>'pricePrimary')::NUMERIC <= $${parameters.length + 1}
        OR COALESCE(product->>'priceSecondary')::NUMERIC <= $${parameters.length + 1}
      )`);
      parameters.push(+maxPrice);
    }
    if (platform) {
      productConditions.push(
        `product->'platform'->>'namePlatform' = $${parameters.length + 1}`,
      );
      parameters.push(platform);
    }
    if (tags.length > 0) {
      const tagConditions = tags
        .map((tag, index) => `tag ILIKE $${parameters.length + 1 + index}`)
        .join(' OR ');
      productConditions.push(`EXISTS (
        SELECT 1
        FROM UNNEST(tags) AS tag
        WHERE ${tagConditions}
      )`);
      parameters.push(...tags.map((tag) => `%${tag}%`));
    }
    if (search) {
      materializedConditions.push(
        `product_materialized.title ILIKE $${parameters.length + 1}`,
      );
      parameters.push(`${search}%`);
    }

    const productWhereClause =
      productConditions.length > 0
        ? `WHERE ${productConditions.join(' AND ')}`
        : '';

    const materializedWhereClause =
      materializedConditions.length > 0
        ? `AND ${materializedConditions.join(' AND ')}`
        : '';

    try {
      const productsQuery = `
        SELECT *
        FROM product_materialized
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(product_materialized.products) AS product
          ${productWhereClause}
        )
        ${materializedWhereClause}
        ORDER BY "createAt"
        LIMIT $${parameters.length + 1}
        OFFSET $${parameters.length + 2}`;

      const countsQuery = `
        SELECT COUNT(*) as count
        FROM product_materialized
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(product_materialized.products) AS product
          ${productWhereClause}
        )
        ${materializedWhereClause}`;

      const productsParameters = [...parameters, limit, offset];
      const countsParameters = [...parameters];

      const [products, [{ count: countsProducts }]] = await Promise.all([
        queryRunner.query(productsQuery, productsParameters),
        queryRunner.query(countsQuery, countsParameters),
      ]);

      const totalPages: number = Math.ceil(+countsProducts / limit);
      const currentPage: number = Math.floor(offset / limit + 1);
      const hasNextPage: boolean = currentPage < totalPages;

      return {
        products,
        countsProducts: +countsProducts,
        totalPages,
        currentPage,
        hasNextPage,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check server logs');
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(term: string): Promise<InfoProduct> {
    let product: InfoProduct[];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      if (!isNaN(+term)) {
        product = await queryRunner.query(
          `
          SELECT * FROM product_materialized
          WHERE product_materialized.product_id = $1
          `,
          [term],
        );
      } else {
        product = await queryRunner.query(
          `
          SELECT * FROM product_materialized
          WHERE product_materialized.slug = '${term}'
          `,
        );
      }

      if (!product[0]) {
        throw new NotFoundException();
      }

      return product[0];
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`Product not found with term: ${term}`);
      }
      console.log(error);
      throw new InternalServerErrorException('Check log server');
    } finally {
      await queryRunner.release();
    }
  }

  async searchProducts(
    term: string,
    paginationDto: PaginationDto,
  ): Promise<InfoProduct[]> {
    const { limit, offset } = paginationDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const product = await queryRunner.query(
        `
          SELECT * FROM product_materialized
          WHERE product_materialized."title" ILIKE '%${term}%'
          LIMIT $1
          OFFSET $2
          `,
        [limit, offset],
      );

      return product;
    } catch (error) {
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

      await queryRunner.query('refresh materialized view product_materialized');

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
