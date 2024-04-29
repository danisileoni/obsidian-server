import { Product } from 'src/products/entities';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric')
  quantityPrimary: number;

  @Column('numeric')
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

  @ManyToOne(() => Product, (product) => product.account, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: Product;
}
