import { AccountsPaid } from 'src/payments/entities/accounts-paid.entity';
import { Product } from 'src/products/entities';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric', {
    nullable: true,
  })
  quantityPrimary: number;

  @Column('numeric', {
    nullable: true,
  })
  quantitySecondary: number;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  email: string;

  @Column('text', {
    nullable: false,
  })
  password: string;

  @Column('text', {
    nullable: false,
  })
  typeAccount: string;

  @ManyToOne(() => Product, (product) => product.account, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: Product;

  @ManyToMany(() => AccountsPaid, (accountPaid) => accountPaid.account)
  accountPaid: AccountsPaid;
}
