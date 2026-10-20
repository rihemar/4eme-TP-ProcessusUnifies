import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './bookings/bookings.module.js';
import { RidesModule } from './rides/rides.module.js';
import { Student } from './students/student.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'better-sqlite3',
        // Tests use ':memory:' (see vitest.config.e2e.ts). PostgreSQL in production.
        database: process.env.DB_PATH ?? 'carpooling.sqlite',
        entities: [Student],
        autoLoadEntities: true,
        // Fine for the Elaboration baseline. Replace with migrations in Construction.
        synchronize: true,
      }),
    }),
    RidesModule,
    BookingsModule,
  ],
})
export class AppModule {}
