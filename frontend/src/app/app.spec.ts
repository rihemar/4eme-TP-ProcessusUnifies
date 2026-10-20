import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { API_URL } from './ride-api.service';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  it('shows the rides returned by GET /rides', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    http.expectOne(`${API_URL}/rides`).flush([
      {
        id: 1,
        driver: { id: 1, email: 'd@univ.tn', fullName: 'Amira' },
        origin: 'La Marsa',
        destination: 'Campus',
        departureAt: '2026-10-21T08:00:00.000Z',
        totalSeats: 3,
        seatsAvailable: 0,
        pricePerSeat: 4,
      },
    ]);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Campus Carpooling');
    expect(el.querySelector('.rides li strong')?.textContent).toContain('La Marsa');
    expect(el.querySelector('.rides li button')?.textContent).toContain('Full');
  });
});
