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
  @PrimaryGeneratedColumn()
  id: string;

  @Column('date', {
    nullable: false,
    default: new Date(),
  })
  createAt: Date;

  @Column('numeric', {
    nullable: true,
  })
  total: number;

  @Column('boolean', {
    default: false,
  })
  paid: boolean;

  @ManyToOne(() => User, (user) => user.orders, {
    eager: true,
    nullable: false,
  })
  @JoinColumn()
  user: User;

  @OneToOne(() => Payment, (payment) => payment.order, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  payment: Payment;

  @OneToMany(() => OrdersDetails, (details) => details.order, {
    eager: true,
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  details: OrdersDetails[];
}
