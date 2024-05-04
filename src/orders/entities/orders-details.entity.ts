import { Product } from 'src/products/entities';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrdersDetails {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Product, (product) => product.ordersDetails)
  @JoinColumn()
  product: Product[];

  @ManyToOne(() => Order, (order) => order.details)
  @JoinColumn()
  order: Order;
}
