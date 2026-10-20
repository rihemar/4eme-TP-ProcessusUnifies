import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Student } from '../students/student.entity.js';

@Entity()
export class Ride {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, { nullable: false, eager: true })
  driver: Relation<Student>;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column({ type: 'datetime' })
  departureAt: Date;

  @Column('int')
  totalSeats: number;

  /**
   * Seats still free. Invariant: 0 <= seatsAvailable <= totalSeats.
   * Only BookingsService.bookSeat() decrements it, with an atomic conditional UPDATE.
   */
  @Column('int')
  seatsAvailable: number;

  @Column('real')
  pricePerSeat: number;
}
