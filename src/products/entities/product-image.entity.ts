import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InfoProduct } from './info-product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', {
    nullable: false,
  })
  url: string;

  @ManyToOne(() => InfoProduct, (infoProduct) => infoProduct.images, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  infoProduct: InfoProduct;
}
