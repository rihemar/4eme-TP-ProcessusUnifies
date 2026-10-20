import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Ride } from '../rides/ride.entity.js';
import { Student } from '../students/student.entity.js';

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

/** A passenger cannot book the same ride twice. */
@Entity()
@Unique(['ride', 'passenger'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ride, { nullable: false, onDelete: 'CASCADE' })
  ride: Relation<Ride>;

  @ManyToOne(() => Student, { nullable: false })
  passenger: Relation<Student>;

  @Column({ type: 'varchar', default: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;
}
