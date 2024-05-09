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
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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

    const accountProduct = await this.productRepository.findOneBy({ id });
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

  async stock(
    id: string,
  ): Promise<{ quantityPrimary: number; quantitySecondary: number }> {
    const accounts = await this.accountRepository.find({
      where: {
        product: {
          id,
        },
      },
    });

    let stock: { quantityPrimary: number; quantitySecondary: number };

    const accountFilterPS = accounts.filter(
      (account) => account.quantityPrimary && account.quantitySecondary,
    );

    if (accountFilterPS) {
      stock = accounts.reduce(
        (acc, obj) => {
          return {
            quantityPrimary: +acc.quantityPrimary + +obj.quantityPrimary,
            quantitySecondary: +acc.quantitySecondary + +obj.quantitySecondary,
          };
        },
        { quantityPrimary: 0, quantitySecondary: 0 },
      );
    } else {
      stock = {
        quantityPrimary: 0,
        quantitySecondary: 0,
      };
    }

    return stock;
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepository.findOneBy({ id });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
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

  private getDecrypt(data: string): string {
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
