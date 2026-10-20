import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride } from './ride.entity.js';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride) private readonly rides: Repository<Ride>,
  ) {}

  findAll(): Promise<Ride[]> {
    return this.rides.find({ order: { departureAt: 'ASC' } });
  }

  async findOne(id: number): Promise<Ride> {
    const ride = await this.rides.findOneBy({ id });
    if (!ride) throw new NotFoundException(`Ride ${id} not found`);
    return ride;
  }
}
