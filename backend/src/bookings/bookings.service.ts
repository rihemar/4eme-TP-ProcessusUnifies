import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ride } from '../rides/ride.entity.js';
import { Student } from '../students/student.entity.js';
import { Booking, BookingStatus } from './booking.entity.js';

@Injectable()
export class BookingsService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * UC3 – Book a seat. See the sequence diagram in docs/elaboration-architecture.md.
   *
   * The overbooking risk is handled by a conditional UPDATE: the database decrements
   * seatsAvailable only if it is still > 0, and reports how many rows changed.
   * When two passengers race for the last seat, only one gets "1 row affected".
   */
  async bookSeat(rideId: number, passengerId: number): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      const passenger = await manager.findOneBy(Student, { id: passengerId });
      if (!passenger) {
        throw new NotFoundException(`Student ${passengerId} not found`);
      }

      const ride = await manager.findOneBy(Ride, { id: rideId });
      if (!ride) {
        throw new NotFoundException(`Ride ${rideId} not found`);
      }

      const alreadyBooked = await manager.existsBy(Booking, {
        ride: { id: rideId },
        passenger: { id: passengerId },
      });
      if (alreadyBooked) {
        throw new ConflictException('You already booked this ride');
      }

      const result = await manager
        .createQueryBuilder()
        .update(Ride)
        .set({ seatsAvailable: () => '"seatsAvailable" - 1' })
        .where('id = :rideId', { rideId })
        .andWhere('"seatsAvailable" > 0')
        .execute();

      if (result.affected !== 1) {
        throw new ConflictException('No seat left on this ride');
      }

      const booking = manager.create(Booking, {
        ride: { id: rideId },
        passenger: { id: passengerId },
        status: BookingStatus.CONFIRMED,
      });
      return manager.save(booking);
    });
  }
}
