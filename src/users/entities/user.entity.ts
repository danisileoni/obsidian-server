import { Payment } from 'src/payments/entities/payment.entity';
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

  @Column('text', {
    nullable: false,
    default: Date(),
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

  @OneToMany(() => Payment, (payment) => payment.user, {
    cascade: true,
    eager: true,
  })
  shopping: Payment[];

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
