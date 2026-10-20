import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { Booking } from '../src/bookings/booking.entity.js';
import { Ride } from '../src/rides/ride.entity.js';
import { Student } from '../src/students/student.entity.js';

/**
 * UC3 – Book a seat, end to end: HTTP → controller → service → database.
 * Milestone M1.2: "N parallel requests for the last seat give exactly 1 booking".
 */
describe('UC3 Book a seat (e2e)', () => {
  let app: INestApplication<App>;
  let db: DataSource;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    db = app.get(DataSource); // fresh in-memory database for each test
  });

  afterEach(async () => {
    await app.close();
  });

  async function createStudents(count: number): Promise<Student[]> {
    const repo = db.getRepository(Student);
    return repo.save(
      Array.from({ length: count }, (_, i) => ({
        email: `student${i}@univ.tn`,
        fullName: `Student ${i}`,
        verified: true,
      })),
    );
  }

  async function createRide(driver: Student, seats: number): Promise<Ride> {
    return db.getRepository(Ride).save({
      driver,
      origin: 'La Marsa',
      destination: 'Campus',
      departureAt: new Date(),
      totalSeats: seats,
      seatsAvailable: seats,
      pricePerSeat: 4,
    });
  }

  function book(rideId: number, passengerId: number) {
    return request(app.getHttpServer())
      .post(`/rides/${rideId}/bookings`)
      .send({ passengerId });
  }

  it('books a seat: 201 and one seat less', async () => {
    const [driver, passenger] = await createStudents(2);
    const ride = await createRide(driver, 3);

    const res = await book(ride.id, passenger.id).expect(201);

    expect(res.body.status).toBe('CONFIRMED');
    const updated = await db.getRepository(Ride).findOneByOrFail({ id: ride.id });
    expect(updated.seatsAvailable).toBe(2);
  });

  it('returns 409 when the ride is full', async () => {
    const [driver, p1, p2] = await createStudents(3);
    const ride = await createRide(driver, 1);

    await book(ride.id, p1.id).expect(201);
    await book(ride.id, p2.id).expect(409);
  });

  it('returns 409 when the same passenger books twice', async () => {
    const [driver, passenger] = await createStudents(2);
    const ride = await createRide(driver, 3);

    await book(ride.id, passenger.id).expect(201);
    await book(ride.id, passenger.id).expect(409);
  });

  it('returns 404 for an unknown ride and 400 for an invalid body', async () => {
    const [passenger] = await createStudents(1);
    await book(999, passenger.id).expect(404);
    await request(app.getHttpServer())
      .post('/rides/1/bookings')
      .send({ passengerId: 'abc' })
      .expect(400);
  });

  it('never overbooks: 5 passengers race for the last seat, exactly 1 wins', async () => {
    const [driver, ...passengers] = await createStudents(6);
    const ride = await createRide(driver, 1);

    const responses = await Promise.all(
      passengers.map((p) => book(ride.id, p.id)),
    );
    const statuses = responses.map((r) => r.status).sort();

    expect(statuses).toEqual([201, 409, 409, 409, 409]);
    expect(await db.getRepository(Booking).countBy({ ride: { id: ride.id } })).toBe(1);
    const updated = await db.getRepository(Ride).findOneByOrFail({ id: ride.id });
    expect(updated.seatsAvailable).toBe(0);
  });
});
