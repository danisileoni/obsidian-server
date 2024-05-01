import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timer } from './entities/timer.entity';
import { Sale } from './entities/sale.entity';
import { Product } from 'src/products/entities';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  imports: [TypeOrmModule.forFeature([Timer, Sale, Product])],
})
export class SalesModule {}
