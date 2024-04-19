import { User } from 'src/users/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric', {
    nullable: false,
  })
  idPayment: number;

  @Column('text', {
    nullable: false,
  })
  nameProduct: string;

  @Column('text', {
    nullable: false,
    default: Date(),
  })
  paymentAt: Date;

  @Column('text', {
    nullable: false,
  })
  email: string;

  @ManyToOne(() => User, (user) => user.shopping)
  user: User;
}
