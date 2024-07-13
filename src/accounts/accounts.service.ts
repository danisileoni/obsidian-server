import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreateAccountDto } from './dto/create-account.dto';
import { type UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Product } from 'src/products/entities';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { type Stock } from 'src/types';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<object> {
    const {
      idProduct: id,
      email,
      password,
      quantityPrimary,
      quantitySecondary,
      typeAccount,
    } = createAccountDto;

    const accountProduct = await this.productRepository.findOne({
      relations: {
        account: true,
      },
      where: { id: +id },
    });
    if (!accountProduct) {
      throw new NotFoundException(`Product not found with id: ${id}`);
    }
    accountProduct.account = [
      ...accountProduct.account,
      this.accountRepository.create({
        email: this.getCrypto(email),
        password: this.getCrypto(password),
        quantityPrimary,
        quantitySecondary,
        typeAccount,
      }),
    ];

    try {
      await this.productRepository.save(accountProduct);
      return {
        message: 'Success create account',
        account: accountProduct.account,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async stock(id: string): Promise<Stock> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const stockSQL = await queryRunner.query(`
        SELECT
          info_product.id,
          SUM(CASE WHEN account."typeAccount"  = 'PlayStation 5' AND account."quantityPrimary" > 0 THEN account."quantityPrimary"  ELSE 0 END) AS primary_ps5_stock,
          SUM(CASE WHEN account."typeAccount" = 'PlayStation 5' AND account."quantitySecondary" > 0 THEN account."quantitySecondary"  ELSE 0 END) AS secondary_ps5_stock,
          SUM(CASE WHEN account."typeAccount" = 'PlayStation 4' AND account."quantityPrimary" > 0 THEN account."quantityPrimary"  ELSE 0 END) AS primary_ps4_stock,
          SUM(CASE WHEN account."typeAccount" = 'PlayStation 4' AND account."quantitySecondary" > 0 THEN account."quantitySecondary"  ELSE 0 END) AS secondary_ps4_stock
        FROM
            info_product
        LEFT JOIN product ON product."infoProductId" = info_product.id
        LEFT JOIN account ON account."productId" = product.id
        WHERE
            info_product.id = '${id}'
        GROUP BY
            info_product.id;
      `);

      return {
        stockPs4: {
          primary: +stockSQL[0].primary_ps4_stock,
          secondary: +stockSQL[0].secondary_ps4_stock,
        },
        stockPs5: {
          primary: +stockSQL[0].primary_ps5_stock,
          secondary: +stockSQL[0].secondary_ps5_stock,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check log server');
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepository.findOneBy({ id });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async findSelect(
    productsId: string,
  ): Promise<Array<{ id: number; quantity: number }>> {
    if (!productsId) {
      throw new NotFoundException('Product IDs not provided');
    }

    const productIdsArray = productsId.split(',');

    const accounts = await this.accountRepository.find({
      relations: ['product'],
      where: { product: { id: In(productIdsArray) } },
    });

    if (accounts.length === 0) {
      throw new NotFoundException('Accounts not found');
    }

    const countAccounts = accounts.reduce<
      Array<{ id: number; quantity: number }>
    >((acc, account) => {
      const productId = account.product.id;
      const existing = acc.find((item) => item.id === productId);

      const quantityPrimary = account.quantityPrimary || 0;
      const quantitySecondary = account.quantitySecondary || 0;
      const extraQuantity = ['Steam', 'PlayStation 3'].includes(
        account.typeAccount,
      )
        ? 1
        : 0;
      const totalQuantity =
        +quantityPrimary + +quantitySecondary + +extraQuantity;

      if (existing) {
        existing.quantity += totalQuantity;
      } else {
        acc.push({ id: productId, quantity: totalQuantity });
      }

      return acc;
    }, []);

    return countAccounts;
  }

  async countAll(): Promise<{ total: number }> {
    const accounts = await this.accountRepository.find();

    const actives = accounts.reduce((acc, value) => {
      let totalIndex = acc + +value.quantityPrimary + +value.quantitySecondary;

      if (value.quantityPrimary === null && value.quantitySecondary === null) {
        totalIndex += 1;
      }

      return totalIndex;
    }, 0);

    return { total: actives };
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const { email, password } = updateAccountDto;

    const account = await this.accountRepository.preload({
      id,
      email: this.getCrypto(email),
      password: this.getCrypto(password),
    });

    if (!account) {
      throw new NotFoundException(`Account not found with id: ${id}`);
    }

    try {
      await this.accountRepository.save(account);

      return account;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string): Promise<object> {
    const account = await this.accountRepository.findOneBy({ id });
    if (!account) {
      throw new NotFoundException(`Account not found with id: ${id}`);
    }

    try {
      await this.accountRepository.remove(account);

      return {
        message: 'Success remove account ',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check the server logs');
    }
  }

  private getCrypto(data: string): string {
    const key: string = this.configService.get('CRYPTO_PASSWORD');
    const iv: string = this.configService.get('CRYPTO_IV');

    const password = Buffer.from(key, 'hex');
    const initializationVector = Buffer.from(iv, 'hex');

    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      password,
      initializationVector,
    );

    let encryptedData = cipher.update(data, 'utf8', 'hex');

    encryptedData += cipher.final('hex');

    return encryptedData;
  }

  public getDecrypt(data: string): string {
    try {
      const key: string = this.configService.get('CRYPTO_PASSWORD');
      const iv: string = this.configService.get('CRYPTO_IV');

      const password = Buffer.from(key, 'hex');
      const initializationVector = Buffer.from(iv, 'hex');

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        password,
        initializationVector,
      );

      let decryptedData = decipher.update(data, 'hex', 'utf8');
      decryptedData += decipher.final('utf8');

      return decryptedData;
    } catch (error) {
      console.log(error);
    }
  }

  private handleDBErrors(error: any): void {
    if (error.code === '23505') {
      const detailsError = error.detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
      throw new BadRequestException(`The ${detailsError[1]} already exists`);
    }

    console.log(error);
    throw new InternalServerErrorException('Check the server logs');
  }
}
