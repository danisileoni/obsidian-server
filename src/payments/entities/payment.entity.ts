import { AccountPaid } from 'src/accounts/entities/accounts-paid.entity';
import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

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

  @OneToMany(() => AccountPaid, (accountPaid) => accountPaid.payment)
  accountPaid: AccountPaid[];
}
