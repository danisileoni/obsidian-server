import { Product } from 'src/products/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrdersDetails {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('numeric')
  quantityPrimary: number;

  @Column('numeric')
  quantitySecondary: number;

  @Column('numeric')
  quantitySteam: number;

  @ManyToOne(() => Product, (product) => product.ordersDetails, {
    eager: true,
    nullable: false,
  })
  @JoinColumn()
  product: Product;

  @ManyToOne(() => Order, (order) => order.details, {
    nullable: false,
  })
  @JoinColumn()
  order: Order;
}
