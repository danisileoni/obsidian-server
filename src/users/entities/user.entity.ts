import { Order } from '../../orders/entities/order.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    nullable: false,
  })
  name: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  username: string;

  @Column('text', {
    nullable: false,
    unique: true,
  })
  email: string;

  @Column('text', {
    nullable: false,
    select: false,
  })
  password: string;

  @Column('date', {
    nullable: false,
    default: new Date().toISOString(),
  })
  createAt: Date;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    nullable: true,
  })
  hashRefreshToken: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @BeforeInsert()
  checkFieldsBeforeInsert(): void {
    this.email = this.email.toLowerCase().trim();
    this.username = this.username.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate(): void {
    this.checkFieldsBeforeInsert();
  }
}
