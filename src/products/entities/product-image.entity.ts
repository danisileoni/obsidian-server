import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InfoProduct } from './info-product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text', {
    nullable: false,
  })
  url: string;

  @ManyToOne(() => InfoProduct, (infoProduct) => infoProduct.images, {
    nullable: false,
  })
  infoProduct: InfoProduct;
}
