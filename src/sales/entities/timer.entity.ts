import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Timer {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column('text', {
    nullable: false,
  })
  title: string;

  @Column('date', {
    nullable: false,
  })
  endDate: Date;
}
