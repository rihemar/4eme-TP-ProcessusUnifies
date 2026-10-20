import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Controller('rides/:rideId/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** 201 booking created · 404 unknown ride/student · 409 ride full or already booked */
  @Post()
  book(
    @Param('rideId', ParseIntPipe) rideId: number,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.bookSeat(rideId, dto.passengerId);
  }
}
