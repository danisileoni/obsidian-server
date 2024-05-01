import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { type CreateSaleDto } from './dto/create-sale.dto';
import { type CreateTimerDto } from './dto/create-timer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Timer } from './entities/timer.entity';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Product } from 'src/products/entities';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Timer)
    private readonly timerRepository: Repository<Timer>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createSaleDto: CreateSaleDto, id: string): Promise<Sale> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      const sale = this.saleRepository.create({
        sale: createSaleDto.sale,
        product,
      });

      await this.saleRepository.save(sale);
      return sale;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs servers');
    }
  }

  async setterTimer(createTimerDto: CreateTimerDto): Promise<Timer> {
    try {
      const timer = this.timerRepository.create(createTimerDto);
      await this.timerRepository.save(timer);
      return timer;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    }
  }

  async findSale(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOneBy({ id });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async timer(): Promise<Timer[]> {
    const timer = await this.timerRepository.find();

    if (timer.length === 0) {
      throw new NotFoundException('Timer not found');
    }

    return timer;
  }

  async removeTimer(): Promise<{ message: string }> {
    const timer = await this.timerRepository.find();

    if (timer.length === 0) {
      throw new NotFoundException('Timer not found');
    }

    try {
      await this.timerRepository.remove(timer[0]);
      return {
        message: 'has been remove correctly',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check server logs');
    }
  }

  async removeSale(id: string): Promise<{ message: string }> {
    const sale = await this.saleRepository.findOneBy({ id });

    if (!sale) {
      throw new NotFoundException(`Sale not found with id: ${id}`);
    }

    try {
      await this.saleRepository.remove(sale);
      return {
        message: `has been remove sale with id: ${id} correctly`,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check server logs');
    }
  }
}