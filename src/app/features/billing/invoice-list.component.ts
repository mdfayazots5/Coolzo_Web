import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BillingApiService } from './billing-api.service';
import { InvoiceListItemResponse } from './billing.models';

@Component({
  selector: 'app-customer-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <h2>My Invoices</h2>
          <p>Review approved commercial charges, your payment progress, and the remaining balance on each service visit.</p>
        </div>
      </div>

      <div class="list" *ngIf="invoices.length; else emptyState">
        <a class="card" *ngFor="let invoice of invoices" [routerLink]="['/my-invoices', invoice.invoiceId]">
          <div>
            <strong>{{ invoice.invoiceNumber }}</strong>
            <p>{{ invoice.quotationNumber }}</p>
            <small>{{ invoice.invoiceDateUtc | date:'mediumDate' }}</small>
          </div>
          <div class="meta">
            <span>{{ invoice.currentStatus }}</span>
            <small>{{ currency(invoice.grandTotalAmount) }}</small>
            <small>{{ currency(invoice.balanceAmount) }} due</small>
          </div>
        </a>
      </div>

      <ng-template #emptyState>
        <div class="empty">
          <h3>No invoices yet</h3>
          <p>Invoices will appear here after an approved quotation is converted into billing.</p>
        </div>
      </ng-template>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 18px; }
    .list { display: grid; gap: 14px; }
    .card { display: flex; justify-content: space-between; gap: 16px; padding: 18px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: #f9fffe; color: inherit; text-decoration: none; }
    .meta { display: grid; justify-items: end; gap: 6px; text-align: right; }
    span { display: inline-flex; padding: 6px 10px; border-radius: 999px; background: rgba(15, 118, 110, 0.12); color: var(--coolzo-primary-dark); font-weight: 700; }
    p, small, h2, h3 { margin: 0; }
    .empty { padding: 24px; border-radius: 20px; border: 1px dashed var(--coolzo-border); text-align: center; }
    .error { color: #be123c; }
  `]
})
export class InvoiceListComponent implements OnInit {
  private readonly billingApiService = inject(BillingApiService);

  invoices: InvoiceListItemResponse[] = [];
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    try {
      const response = await this.billingApiService.getMyInvoices();
      this.invoices = response.items;
    } catch {
      this.errorMessage = 'Unable to load invoices right now.';
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  }
}
