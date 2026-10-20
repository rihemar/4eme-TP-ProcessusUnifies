import { DataSource } from 'typeorm';
import { Ride } from '../rides/ride.entity.js';
import { Student } from '../students/student.entity.js';

/** Demo data for local runs. Does nothing if the database already has students. */
export async function seed(dataSource: DataSource): Promise<void> {
  const students = dataSource.getRepository(Student);
  if ((await students.count()) > 0) return;

  const [driver] = await students.save([
    { email: 'driver@univ.tn', fullName: 'Amira Driver', verified: true },
    { email: 'passenger1@univ.tn', fullName: 'Youssef Passenger', verified: true },
    { email: 'passenger2@univ.tn', fullName: 'Salma Passenger', verified: true },
  ]);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await dataSource.getRepository(Ride).save([
    {
      driver,
      origin: 'La Marsa',
      destination: 'Campus',
      departureAt: tomorrow,
      totalSeats: 3,
      seatsAvailable: 3,
      pricePerSeat: 4,
    },
    {
      driver,
      origin: 'Ariana',
      destination: 'Campus',
      departureAt: tomorrow,
      totalSeats: 1,
      seatsAvailable: 1,
      pricePerSeat: 3,
    },
  ]);
}
