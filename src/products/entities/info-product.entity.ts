import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Product } from './product.entity';

@Entity()
export class InfoProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  title: string;

  @Column('text')
  description: string;

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
    default: new Date(),
  })
  createAt: string;

  @OneToMany(() => ProductImage, (productImage) => productImage.infoProduct, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  images: ProductImage[];

  @OneToMany(() => Product, (product) => product.infoProduct, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
    eager: true,
  })
  product: Product[];

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
