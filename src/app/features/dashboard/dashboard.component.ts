import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="dashboard">
      <div class="hero">
        <div>
          <p class="eyebrow">Customer Portal</p>
          <h2>Welcome back, {{ authService.getFullName() }}</h2>
          <p>Review your booking history, start a new request, and keep the customer-side flow moving without leaving the portal.</p>
        </div>
        <div class="actions">
          <a routerLink="/booking">Book a Service</a>
          <a routerLink="/my-bookings" class="secondary">View My Bookings</a>
          <a routerLink="/my-invoices" class="secondary">View My Invoices</a>
          <a routerLink="/support-tickets" class="secondary">Support Tickets</a>
          <a routerLink="/amc" class="secondary">View AMC</a>
          <a routerLink="/service-history" class="secondary">View Service History</a>
        </div>
      </div>

      <div class="grid">
        <article>
          <h3>Booking wizard reuse</h3>
          <p>The same Phase 1 flow works for guest booking and logged-in customer booking without duplicating UI logic.</p>
        </article>
        <article>
          <h3>Lookup-driven UX</h3>
          <p>Categories, services, equipment, zones, and slots all come from the booking lookup APIs instead of UI constants.</p>
        </article>
        <article>
          <h3>Customer-safe records</h3>
          <p>Your booking history and detail screens only resolve the current customer’s own records.</p>
        </article>
        <article>
          <h3>Commercial follow-through</h3>
          <p>Approve quotations, review invoices, and confirm payment updates without leaving the portal.</p>
        </article>
        <article>
          <h3>Lifecycle continuity</h3>
          <p>Track AMC coverage, raise warranty claims, request revisits, and keep the full service history connected.</p>
        </article>
        <article>
          <h3>Support continuity</h3>
          <p>Raise a support ticket from your booking, billing, AMC, warranty, or revisit flow and follow the full resolution timeline.</p>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .dashboard { display: grid; gap: 24px; }
    .hero { display: grid; gap: 20px; padding: 24px; border-radius: 24px; background: linear-gradient(135deg, #e7fbf6 0%, #ffffff 100%); border: 1px solid var(--coolzo-border); }
    .eyebrow { margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    h2 { margin: 0 0 8px; font-size: 32px; }
    p { margin: 0; line-height: 1.6; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    a { display: inline-flex; align-items: center; justify-content: center; padding: 12px 18px; border-radius: 999px; background: var(--coolzo-primary); color: white; text-decoration: none; font-weight: 700; }
    .secondary { background: white; color: var(--coolzo-primary-dark); border: 1px solid var(--coolzo-border); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    article { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    h3 { margin-top: 0; }
  `]
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
}
