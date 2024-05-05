import { Account } from 'src/accounts/entities/account.entity';
import {
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class AccountsPaid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => Account, (account) => account.accountPaid)
  @JoinTable()
  account: Account[];

  @ManyToOne(() => Payment, (payment) => payment.accountsPaid)
  @JoinColumn()
  payment: Payment;
}
