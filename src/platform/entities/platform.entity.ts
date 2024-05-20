import { Product } from 'src/products/entities';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Platform {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text', {
    nullable: false,
  })
  namePlatform: string;

  @OneToMany(() => Product, (product) => product.platform)
  product: Product[];
}
