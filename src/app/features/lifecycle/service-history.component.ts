import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LifecycleApiService } from './lifecycle-api.service';
import { ServiceHistoryItemResponse } from './lifecycle.models';

@Component({
  selector: 'app-service-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <div class="hero">
        <div>
          <p class="eyebrow">Service History</p>
          <h2>Everything linked across your lifecycle</h2>
          <p>Bookings, job completions, invoices, AMC assignments, and revisit records all appear together here for a complete customer-side trail.</p>
        </div>
        <div class="hero-summary">
          <strong>{{ historyItems.length }}</strong>
          <span>history items</span>
        </div>
      </div>

      <div class="history-list" *ngIf="historyItems.length > 0; else emptyState">
        <article *ngFor="let item of historyItems">
          <div class="item-head">
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.referenceNumber }}</p>
            </div>
            <span>{{ item.status }}</span>
          </div>
          <small>{{ item.historyType }} • {{ item.eventDateUtc | date:'medium' }}</small>
          <p>{{ item.detail }}</p>
          <small *ngIf="item.amount !== null">Amount: {{ currency(item.amount || 0) }}</small>
          <div class="action-row">
            <a *ngIf="item.invoiceId" [routerLink]="['/my-invoices', item.invoiceId]">Open Invoice</a>
            <a *ngIf="!item.invoiceId && item.bookingId" [routerLink]="['/my-bookings', item.bookingId]">Open Booking</a>
            <a *ngIf="!item.invoiceId && !item.bookingId && item.customerAmcId" routerLink="/amc">Open AMC</a>
          </div>
        </article>
      </div>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #emptyState>
      <div class="empty-state">
        <h3>No service history available yet</h3>
        <p>Your linked service lifecycle entries will appear here after the first authenticated booking moves through execution and billing.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .hero { display: flex; justify-content: space-between; gap: 16px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #eefcf8 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .hero-summary { min-width: 140px; padding: 18px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; display: grid; place-items: center; }
    .history-list { display: grid; gap: 14px; }
    article { padding: 18px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; display: grid; gap: 8px; }
    .item-head { display: flex; justify-content: space-between; gap: 12px; }
    .item-head span { padding: 6px 10px; border-radius: 999px; background: rgba(15, 118, 110, 0.12); color: var(--coolzo-primary-dark); font-weight: 700; height: fit-content; }
    .action-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .action-row a { text-decoration: none; color: var(--coolzo-primary-dark); font-weight: 700; }
    .empty-state { padding: 24px; border-radius: 20px; border: 1px dashed var(--coolzo-border); text-align: center; }
    h2, h3, p, small, strong, span { margin: 0; }
    .error { color: #be123c; }
  `]
})
export class ServiceHistoryComponent implements OnInit {
  private readonly lifecycleApiService = inject(LifecycleApiService);

  historyItems: ServiceHistoryItemResponse[] = [];
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    try {
      this.historyItems = await this.lifecycleApiService.getMyServiceHistory();
    } catch {
      this.errorMessage = 'Unable to load service history right now.';
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }
}
