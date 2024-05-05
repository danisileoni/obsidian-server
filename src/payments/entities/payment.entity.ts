import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AccountsPaid } from './accounts-paid.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    nullable: false,
  })
  idPayment: string;

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

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn()
  order: Order;

  @OneToMany(() => AccountsPaid, (accountPaid) => accountPaid.payment)
  accountsPaid: AccountsPaid[];
}
