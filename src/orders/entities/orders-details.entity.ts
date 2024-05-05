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

  @Column('numeric', {
    nullable: true,
  })
  quantityPrimary: number;

  @Column('numeric', {
    nullable: true,
  })
  quantitySecondary: number;

  @Column('numeric', {
    nullable: true,
  })
  quantitySteam: number;

  @ManyToOne(() => Product, (product) => product.ordersDetails, {
    eager: true,
  })
  @JoinColumn()
  product: Product;

  @ManyToOne(() => Order, (order) => order.details)
  @JoinColumn()
  order: Order;
}
