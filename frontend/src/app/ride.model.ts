export interface Student {
  id: number;
  email: string;
  fullName: string;
}

export interface Ride {
  id: number;
  driver: Student;
  origin: string;
  destination: string;
  departureAt: string;
  totalSeats: number;
  seatsAvailable: number;
  pricePerSeat: number;
}

export interface Booking {
  id: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}
