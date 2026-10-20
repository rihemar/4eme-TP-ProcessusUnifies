import { IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  /** Temporary until UC1 authentication: the passenger id comes from the request body. */
  @IsInt()
  @Min(1)
  passengerId: number;
}
