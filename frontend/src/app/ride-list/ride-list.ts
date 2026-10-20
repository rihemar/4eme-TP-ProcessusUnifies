import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RideApiService } from '../ride-api.service';
import { Ride } from '../ride.model';

/**
 * Until UC1 (authentication) is built, the user picks which seeded passenger they act as.
 * The ids match backend/src/database/seed.ts.
 */
const DEMO_PASSENGERS = [
  { id: 2, name: 'Youssef' },
  { id: 3, name: 'Salma' },
];

@Component({
  selector: 'app-ride-list',
  imports: [DatePipe, FormsModule],
  templateUrl: './ride-list.html',
  styleUrl: './ride-list.css',
})
export class RideList implements OnInit {
  private readonly api = inject(RideApiService);

  protected readonly passengers = DEMO_PASSENGERS;
  protected passengerId = DEMO_PASSENGERS[0].id;
  protected readonly rides = signal<Ride[]>([]);
  protected readonly message = signal<{ text: string; ok: boolean } | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getRides().subscribe({
      next: (rides) => this.rides.set(rides),
      error: () => this.message.set({ text: 'Cannot reach the API. Is the backend running?', ok: false }),
    });
  }

  book(ride: Ride): void {
    this.api.book(ride.id, this.passengerId).subscribe({
      next: () => {
        this.message.set({ text: `Seat booked: ${ride.origin} → ${ride.destination}`, ok: true });
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.message.set({ text: err.error?.message ?? 'Booking failed', ok: false });
        this.load();
      },
    });
  }
}
