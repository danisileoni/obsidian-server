import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InfoProduct } from './info-product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    nullable: false,
  })
  url: string;

  @ManyToOne(() => InfoProduct, (infoProduct) => infoProduct.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  infoProduct: InfoProduct;
}
