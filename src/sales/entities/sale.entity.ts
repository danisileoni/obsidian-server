import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('int', {
    nullable: false,
  })
  sale: number;

  @Column('numeric', {
    nullable: true,
  })
  salePrimary: number;

  @Column('numeric', {
    nullable: true,
  })
  saleSecondary: number;

  @Column('numeric', {
    nullable: true,
  })
  salePrice: number;

  @Column('text', {
    nullable: false,
    default: new Date(),
  })
  finallySaleAt: Date;

  @Column('date', {
    nullable: false,
    default: new Date(),
  })
  createAt: Date;

  @OneToOne(() => Product, (product) => product.sale)
  @JoinColumn()
  product: Product;

  constructor(product: Product) {
    this.product = product;
  }

  @BeforeInsert()
  async setPrices(): Promise<void> {
    if (this.product) {
      const discountPercentage = this.sale / 100;
      if (this.product.priceSecondary && this.product.pricePrimary) {
        this.salePrimary = this.product.pricePrimary * (1 - discountPercentage);
        this.saleSecondary =
          this.product.priceSecondary * (1 - discountPercentage);
      }
      if (this.product.price) {
        this.salePrice = this.product.price * (1 - discountPercentage);
      }
    }
  }
}
