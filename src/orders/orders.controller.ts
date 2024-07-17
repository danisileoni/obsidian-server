import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { type Order } from './entities/order.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.enum';
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  @Auth(ValidRoles.user)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() idUser: User,
  ): Promise<Order> {
    return await this.ordersService.create(createOrderDto, idUser);
  }

  @Get('search/:id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return await this.ordersService.findOne(id);
  }

  @Get()
  async find(): Promise<Order[]> {
    return await this.ordersService.find();
  }

  @Get('total')
  async totalProceeds(): Promise<{ total: number }> {
    return await this.ordersService.totalProceeds();
  }

  @Get('user/:id')
  async findOrderUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Order[]> {
    return await this.ordersService.findOrderUser(id);
  }

  @Get('total-by-month')
  async getTotalByMonth(): Promise<
    Array<{ month: number; total: number | null }>
  > {
    return await this.ordersService.getTotalByMonth();
  }

  @Get('count-order-paid')
  async countOrdersPaid(): Promise<
    Array<{ month: number; total: number | null }>
  > {
    return await this.ordersService.countOrdersPaid();
  }

  @Put(':id')
  @Auth(ValidRoles.admin)
  async disablePaid(@Param('id') id: string): Promise<{ message: string }> {
    return await this.ordersService.disablePaid(id);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.ordersService.remove(id);
  }
}
