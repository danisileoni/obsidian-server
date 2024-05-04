import { Injectable } from '@nestjs/common';
import { type CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { In, Repository } from 'typeorm';
import { Product } from 'src/products/entities';
import { User } from 'src/users/entities/user.entity';
import { OrdersDetails } from './entities/orders-details.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrdersDetails)
    private readonly ordersDetailsRepository: Repository<OrdersDetails>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createOrderDto: CreateOrderDto, idUser: User): Promise<Order> {
    const products = await this.productRepository.find({
      where: { id: In(createOrderDto.idsProducts) },
    });

    const user = await this.userRepository.findOneBy({ id: idUser.id });

    const order = this.orderRepository.create({
      user,
      details: products.map((product) => {
        return this.ordersDetailsRepository.create(product);
      }),
    });

    await this.orderRepository.save(order);

    return order;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
