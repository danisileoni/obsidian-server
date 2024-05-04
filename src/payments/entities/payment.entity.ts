import { Account } from 'src/accounts/entities/account.entity';
import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO: change a string or transform
  @Column('text', {
    nullable: false,
  })
  idPayment: string;

  @Column('text', {
    nullable: false,
  })
  nameProduct: string;

  @Column('text', {
    nullable: false,
    default: Date(),
  })
  paymentAt: Date;

  @Column('text', {
    nullable: false,
  })
  email: string;

  @Column('text', {
    nullable: false,
  })
  paymentGateway: string;

  @ManyToOne(() => Account, (account) => account.payment)
  account: Account;

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;
}
