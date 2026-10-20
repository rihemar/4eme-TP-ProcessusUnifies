import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './ride.entity.js';
import { RidesController } from './rides.controller.js';
import { RidesService } from './rides.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Ride])],
  controllers: [RidesController],
  providers: [RidesService],
})
export class RidesModule {}
