import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking, Ride } from './ride.model';

export const API_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class RideApiService {
  private readonly http = inject(HttpClient);

  getRides(): Observable<Ride[]> {
    return this.http.get<Ride[]>(`${API_URL}/rides`);
  }

  /** UC3 – POST /rides/:rideId/bookings */
  book(rideId: number, passengerId: number): Observable<Booking> {
    return this.http.post<Booking>(`${API_URL}/rides/${rideId}/bookings`, { passengerId });
  }
}
