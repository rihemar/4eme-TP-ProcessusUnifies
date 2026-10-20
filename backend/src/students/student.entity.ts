import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** A university member. Parent of Passenger and Driver in the use case diagram. */
@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  /** University email, used for UC1 verification. */
  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ default: false })
  verified: boolean;
}
