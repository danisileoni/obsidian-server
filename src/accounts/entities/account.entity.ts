import { Product } from 'src/products/entities';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AccountPaid } from './accounts-paid.entity';

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
    nullable: false,
  })
  @JoinColumn()
  product: Product;

  @OneToMany(() => AccountPaid, (accountPaid) => accountPaid.account, {
    eager: true,
  })
  paid: AccountPaid[];
}
