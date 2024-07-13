import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateTimerDto } from './dto/create-timer.dto';
import { type Timer } from './entities/timer.entity';
import { type Sale } from './entities/sale.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.enum';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('create/:id')
  @Auth(ValidRoles.admin)
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @Param('id') id: string,
  ): Promise<Sale> {
    return await this.salesService.create(createSaleDto, id);
  }

  @Post('setter-timer-sales')
  @Auth(ValidRoles.admin)
  async setterTime(@Body() createTimerDto: CreateTimerDto): Promise<Timer> {
    return await this.salesService.setterTimer(createTimerDto);
  }

  @Get(':id')
  async findSale(@Param('id') id: string): Promise<Sale> {
    return await this.salesService.findSale(id);
  }

  @Get('timer')
  async timer(): Promise<Timer[]> {
    return await this.salesService.timer();
  }

  @Delete('timer')
  async removeTimer(): Promise<{ message: string }> {
    return await this.salesService.removeTimer();
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  async removeSale(@Param('id') id: string): Promise<{ message: string }> {
    return await this.salesService.removeSale(id);
  }
}
