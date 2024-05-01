import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './';
import { Account } from 'src/accounts/entities/account.entity';
import { Sale } from 'src/sales/entities/sale.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  title: string;

  @Column('text')
  description: string;

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
    nullable: false,
  })
  slug: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @Column('text', {
    default: Date(),
  })
  createAt: Date;

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  @OneToMany(() => Account, (account) => account.product, {
    cascade: true,
    eager: true,
  })
  account: Account[];

  @OneToOne(() => Sale, (sale) => sale.product, {
    eager: true,
    cascade: true,
  })
  sale: Sale;

  @BeforeInsert()
  checkSlugInsert(): void {
    this.slug = this.title
      .toLocaleLowerCase()
      .trim()
      .replaceAll(' ', '_')
      .replaceAll("'", '')
      .replaceAll('.', '');
  }

  @BeforeUpdate()
  checkSlugUpdate(): void {
    this.slug = this.title
      .toLocaleLowerCase()
      .trim()
      .replaceAll(' ', '_')
      .replaceAll("'", '')
      .replaceAll('.', '');
  }
}
