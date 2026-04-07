import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../booking/booking-api.service';
import { BookingListItemResponse } from '../booking/booking.models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <h2>My Bookings</h2>
          <p>Review the bookings created through the authenticated customer flow.</p>
        </div>
        <a routerLink="/booking">Create New Booking</a>
      </div>

      <div class="list" *ngIf="bookings.length > 0; else emptyState">
        <a class="card" *ngFor="let booking of bookings" [routerLink]="['/my-bookings', booking.bookingId]">
          <div>
            <strong>{{ booking.bookingReference }}</strong>
            <p>{{ booking.serviceName }}</p>
            <small>Booking status: <span class="status-chip">{{ booking.status }}</span></small>
          </div>
          <div>
            <span>{{ booking.operationalStatus || 'Awaiting operations' }}</span>
            <small>{{ booking.assignedTechnicianName || 'Technician not assigned yet' }}</small>
            <small>{{ booking.slotDate }} • {{ booking.slotLabel }}</small>
          </div>
        </a>
      </div>

      <ng-template #emptyState>
        <div class="empty">
          <h3>No bookings yet</h3>
          <p>Your confirmed customer bookings will appear here after you complete the booking wizard while signed in.</p>
        </div>
      </ng-template>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 18px; }
    .header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .header a { padding: 12px 18px; border-radius: 999px; text-decoration: none; color: white; background: var(--coolzo-primary); font-weight: 700; }
    .list { display: grid; gap: 14px; }
    .card { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: #f9fffe; color: inherit; text-decoration: none; }
    strong { font-size: 18px; }
    p, small { margin: 6px 0 0; color: #49706b; }
    span { display: inline-flex; padding: 6px 10px; border-radius: 999px; background: rgba(15, 118, 110, 0.12); color: var(--coolzo-primary-dark); font-weight: 700; }
    .status-chip { background: rgba(194, 65, 12, 0.14); color: #9a3412; margin-left: 4px; }
    .empty { padding: 24px; border-radius: 20px; border: 1px dashed var(--coolzo-border); text-align: center; }
    .error { margin: 0; color: #be123c; }
  `]
})
export class MyBookingsComponent implements OnInit {
  private readonly bookingApi = inject(BookingApiService);

  bookings: BookingListItemResponse[] = [];
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    try {
      const response = await this.bookingApi.getMyBookings();
      this.bookings = response.items;
    } catch {
      this.errorMessage = 'Unable to load customer bookings right now.';
    }
  }
}
