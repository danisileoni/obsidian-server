import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './';

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
    default: 0,
  })
  pricePrimary: number;

  @Column('numeric', {
    default: 0,
  })
  priceSecondary: number;

  @Column('numeric', {
    default: 0,
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
  })
  images: ProductImage[];
}
