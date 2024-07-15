import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    let totalPrice: number = 0;

    const products = await this.productRepository.find({
      relations: { account: true },
      where: { id: In(createOrderDto.items.map((item) => item.idProduct)) },
    });
    if (products.length === 0) {
      throw new NotFoundException(
        `Products not found with id's: ${createOrderDto.items.toString()}`,
      );
    }

    products.forEach((product) => {
      const item = createOrderDto.items.find(
        (item) => +product.id === +item.idProduct,
      );

      if (item.quantitySteam >= 1) {
        if (product.sale) {
          totalPrice += +product.sale.salePrice;
          return;
        }
        totalPrice += +product.price;
        return;
      }
      if (item.quantityPrimary >= 1) {
        if (product.sale) {
          totalPrice += +product.sale.salePrimary;
          return;
        }
        totalPrice += +product.pricePrimary;
        return;
      }
      if (item.quantitySecondary >= 1) {
        if (product.sale) {
          totalPrice += +product.sale.saleSecondary;
          return;
        }
        totalPrice += +product.priceSecondary;
        return;
      }
      if (item.quantityPlayStation3 >= 1) {
        if (product.sale) {
          totalPrice += +product.sale.salePrice;
          return;
        }
        totalPrice += +product.price;
        return;
      }
      throw new BadRequestException('Info invalid');
    });

    // TODO: validation for type of account
    const productsMap = products.map((product) => {
      const { account, ...rest } = product;
      return rest;
    });

    const user = await this.userRepository.findOneBy({ id: idUser.id });
    if (!user) {
      throw new NotFoundException(`User not found with id: ${idUser.id}`);
    }

    const order = this.orderRepository.create({
      user,
      total: totalPrice,
      details: productsMap.map((product) => {
        const index = createOrderDto.items.findIndex(item => +item.idProduct === product.id)
        return this.ordersDetailsRepository.create({
          product,
          quantityPrimary: createOrderDto.items[index].quantityPrimary,
          quantitySecondary: createOrderDto.items[index].quantitySecondary,
          quantitySteam: createOrderDto.items[index].quantitySteam,
          quantityPlayStation3:
            createOrderDto.items[index].quantityPlayStation3,
        });
      }),
    });

    await this.orderRepository.save(order);

    delete order.user;

    return order;
  }

  async totalProceeds(): Promise<{ total: number }> {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const total = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.paid = :paid', { paid: true })
      .andWhere('EXTRACT(month from order.createAt) = :month', { month })
      .andWhere('EXTRACT(year from order.createAt) = :year', { year })
      .getRawOne();

    return { total: total.total };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository
      .findOne({
        relations: {
          details: true,
        },
        where: { id },
      })
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('Check logs server');
      });
    if (!order) {
      throw new NotFoundException(`Order not found with id: ${id}`);
    }

    return order;
  }

  async find(): Promise<Order[]> {
    const orders = await this.orderRepository.find().catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    });

    if (orders.length <= 0) {
      throw new NotFoundException('Orders not found');
    }

    return orders;
  }

  async getTotalByMonth(): Promise<
    Array<{ month: number; total: number | null }>
  > {
    const year = new Date().getFullYear();

    const result = await this.orderRepository.query(
      `
      SELECT
        months.month,
        COALESCE(SUM(o.total), null) AS total
      FROM
        generate_series(1, 12) AS months(month)
      LEFT JOIN
        "order" o
      ON
        EXTRACT(MONTH FROM o."createAt") = months.month
        AND EXTRACT(YEAR FROM o."createAt") = $1
        AND o.paid = true
      GROUP BY
        months.month
      ORDER BY
        months.month
      `,
      [year],
    );

    return result;
  }

  async countOrdersPaid(): Promise<
    Array<{ month: number; total: number | null }>
  > {
    const year = new Date().getFullYear();

    const result = await this.orderRepository.query(
      `
      SELECT
        months.month,
        CASE
          WHEN COUNT(o.id) = 0 THEN NULL
          ELSE COUNT(o.id)
        END AS total
      FROM
        generate_series(1, 12) AS months(month)
      LEFT JOIN
        "order" o
      ON
        EXTRACT(MONTH FROM o."createAt") = months.month
        AND EXTRACT(YEAR FROM o."createAt") = $1
        AND o.paid = true
      GROUP BY
        months.month
      ORDER BY
        months.month
      `,
      [year],
    );

    return result;
  }

  async findOrderUser(id: string): Promise<Order[]> {
    try {
      const orders = await this.orderRepository.find({
        relations: { details: { product: { infoProduct: true } } },
        where: {
          user: { id },
          paid: true,
        },
        order: {
          id: {
            direction: 'DESC',
          },
        },
      });

      if (orders.length <= 0) {
        throw new NotFoundException('Orders not found');
      }

      return orders;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    }
  }

  async disablePaid(id: string): Promise<{ message: string }> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order not found with id: ${id}`);
    }

    const updateOrder = await this.orderRepository.preload({
      ...order,
      paid: false,
    });

    await this.orderRepository.save(updateOrder).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    });

    return {
      message: 'the payment has been assigned as null',
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order not found with id: ${id}`);
    }
    try {
      await this.orderRepository.remove(order);

      return {
        message: 'The order has been deleted correctly',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Check logs server');
    }
  }
}
