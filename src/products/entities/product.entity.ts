import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { OrdersDetails } from 'src/orders/entities/orders-details.entity';
import { Platform } from 'src/platform/entities/platform.entity';
import { InfoProduct } from './info-product.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('numeric', {
    nullable: true,
  })
  pricePrimary: number;

  @Column('numeric', {
    nullable: true,
  })
  priceSecondary: number;

  @Column('numeric', {
    nullable: true,
  })
  price: number;

  @Column('text', {
    default: new Date().toISOString(),
  })
  createAt: Date;

  @OneToMany(() => Account, (account) => account.product, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  account: Account[];

  @OneToOne(() => Sale, (sale) => sale.product, {
    onDelete: 'CASCADE',
    eager: true,
    cascade: ['insert', 'update'],
  })
  sale: Sale;

  @ManyToOne(() => InfoProduct, (infoProduct) => infoProduct.product, {
    onDelete: 'CASCADE',
  })
  infoProduct: InfoProduct;

  @ManyToOne(() => Platform, (platform) => platform.product)
  platform: Platform;

  @OneToMany(() => OrdersDetails, (product) => product.product, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  ordersDetails: OrdersDetails;
}
