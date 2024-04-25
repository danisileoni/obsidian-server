import { User } from 'src/users/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // TODO: change a string or transform
  @Column('text', {
    nullable: false,
  })
  idPayment: string;

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

  @Column('text', {
    nullable: false,
  })
  paymentGateway: string;

  @ManyToOne(() => User, (user) => user.shopping)
  user: User;
}
