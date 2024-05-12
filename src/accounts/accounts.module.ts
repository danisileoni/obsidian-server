import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { ProductsModule } from 'src/products/products.module';
import { Product } from 'src/products/entities';
import { ConfigModule } from '@nestjs/config';
import { AccountPaid } from './entities/accounts-paid.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Account, Product, AccountPaid]),
    ProductsModule,
  ],
  exports: [AccountsModule, AccountsService],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
