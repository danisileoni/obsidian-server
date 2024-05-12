import { Controller, Post, Body, Param, Delete, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { type Order } from './entities/order.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.enum';

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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return await this.ordersService.findOne(id);
  }

  @Get()
  async find(): Promise<Order[]> {
    return await this.ordersService.find();
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.ordersService.remove(id);
  }
}
