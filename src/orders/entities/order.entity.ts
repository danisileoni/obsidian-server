import { Payment } from 'src/payments/entities/payment.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrdersDetails } from './orders-details.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    nullable: false,
    default: new Date(),
  })
  createAt: Date;

  @Column('boolean', {
    default: false,
  })
  paid: boolean;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn()
  user: User;

  @OneToOne(() => Payment, (payment) => payment.order)
  @JoinColumn()
  payment: Payment;

  @OneToMany(() => OrdersDetails, (details) => details.order, {
    eager: true,
    cascade: true,
  })
  details: OrdersDetails[];
}
