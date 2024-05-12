import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Entity()
export class AccountPaid {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Account, (account) => account.paid, {
    nullable: false,
  })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @ManyToOne(() => Payment, (payment) => payment.accountPaid, {
    nullable: false,
  })
  @JoinColumn()
  payment: Payment;
}
