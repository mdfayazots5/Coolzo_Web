import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingApiService } from './billing-api.service';
import { InvoiceDetailResponse } from './billing.models';

@Component({
  selector: 'app-customer-invoice-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page" *ngIf="invoice; else loadingState">
      <a routerLink="/my-invoices" class="back-link">← Back to My Invoices</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Invoice</p>
          <h2>{{ invoice.invoiceNumber }}</h2>
          <p>{{ invoice.serviceName }} • {{ invoice.currentStatus }}</p>
          <small>{{ invoice.invoiceDateUtc | date:'medium' }}</small>
        </div>
        <div class="price">{{ currency(invoice.balanceAmount) }} due</div>
      </div>

      <div class="summary-grid">
        <article>
          <h3>Totals</h3>
          <p>Grand total: {{ currency(invoice.grandTotalAmount) }}</p>
          <small>{{ currency(invoice.paidAmount) }} paid</small>
          <small>{{ currency(invoice.balanceAmount) }} balance</small>
        </article>
        <article>
          <h3>Payment status</h3>
          <p>{{ invoice.currentStatus }}</p>
          <small>{{ invoice.lastPaymentDateUtc ? ('Last payment on ' + (invoice.lastPaymentDateUtc | date:'mediumDate')) : 'No payment recorded yet.' }}</small>
          <a [routerLink]="['/warranty/invoice', invoice.invoiceId]" class="inline-link">Check Warranty</a>
          <a
            [routerLink]="['/support-tickets/new']"
            [queryParams]="{
              linkedEntityType: 'Invoice',
              linkedEntityId: invoice.invoiceId,
              subject: 'Support needed for invoice ' + invoice.invoiceNumber,
              linkLabel: invoice.invoiceNumber
            }"
            class="inline-link">
            Raise Support Ticket
          </a>
        </article>
      </div>

      <div class="detail-grid">
        <section>
          <h3>Invoice lines</h3>
          <div class="line-card" *ngFor="let line of invoice.lines">
            <strong>{{ line.lineDescription }}</strong>
            <p>{{ line.lineType }}</p>
            <small>{{ line.quantity }} × {{ currency(line.unitPrice) }} = {{ currency(line.lineAmount) }}</small>
          </div>
        </section>

        <section>
          <h3>Record Payment</h3>
          <form class="payment-form" [formGroup]="paymentForm" (ngSubmit)="recordPayment()">
            <label>
              Amount
              <input type="number" min="0" step="0.01" formControlName="paidAmount" />
            </label>
            <label>
              Method
              <select formControlName="paymentMethod">
                <option value="Cash">Cash</option>
                <option value="Upi">UPI</option>
                <option value="Card">Card</option>
              </select>
            </label>
            <label>
              Reference Number
              <input type="text" formControlName="referenceNumber" placeholder="Optional transaction reference" />
            </label>
            <label>
              Remarks
              <textarea rows="3" formControlName="remarks" placeholder="Optional payment note"></textarea>
            </label>
            <button type="submit" [disabled]="paymentForm.invalid || isRecordingPayment || invoice.balanceAmount <= 0">
              {{ isRecordingPayment ? 'Saving...' : 'Confirm Payment' }}
            </button>
          </form>
        </section>

        <section>
          <h3>Payment summary</h3>
          <div class="history-card" *ngFor="let payment of invoice.payments">
            <strong>{{ payment.paymentMethod }} • {{ currency(payment.paidAmount) }}</strong>
            <p>{{ payment.referenceNumber || 'No reference supplied' }}</p>
            <small>{{ payment.paymentDateUtc | date:'medium' }}</small>
            <small *ngIf="payment.receipt">Receipt: {{ payment.receipt.receiptNumber }}</small>
          </div>
          <p *ngIf="invoice.payments.length === 0">No payments have been recorded yet.</p>
        </section>
      </div>

      <p class="message" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #loadingState>
      <section class="page">
        <p>{{ errorMessage || 'Loading invoice...' }}</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .back-link { color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .hero { display: flex; justify-content: space-between; gap: 16px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #eafaf7 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .price { padding: 14px 18px; border-radius: 999px; background: white; border: 1px solid var(--coolzo-border); font-weight: 700; }
    .summary-grid, .detail-grid { display: grid; gap: 16px; }
    .summary-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .detail-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    article, section { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    .payment-form { display: grid; gap: 12px; }
    label { display: grid; gap: 8px; font-weight: 700; }
    input, select, textarea { border: 1px solid var(--coolzo-border); border-radius: 14px; padding: 11px 12px; font: inherit; }
    button { border: 0; border-radius: 999px; padding: 12px 18px; background: var(--coolzo-primary); color: white; font-weight: 700; cursor: pointer; }
    .inline-link { width: fit-content; margin-top: 8px; color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .line-card, .history-card { padding: 14px; border-radius: 16px; background: #f9fffe; border: 1px solid var(--coolzo-border); margin-top: 12px; }
    p, small, h2, h3 { margin: 0; }
    .message { color: #166534; }
    .error { color: #be123c; }
  `]
})
export class InvoiceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly billingApiService = inject(BillingApiService);

  invoice: InvoiceDetailResponse | null = null;
  errorMessage = '';
  message = '';
  isRecordingPayment = false;

  readonly paymentForm = this.formBuilder.group({
    paidAmount: [0, [Validators.required, Validators.min(0.01)]],
    paymentMethod: ['Upi', Validators.required],
    referenceNumber: [''],
    remarks: ['']
  });

  async ngOnInit(): Promise<void> {
    await this.loadInvoice();
  }

  async loadInvoice(): Promise<void> {
    const invoiceId = Number(this.route.snapshot.paramMap.get('invoiceId'));

    if (!invoiceId) {
      this.errorMessage = 'Invalid invoice identifier.';
      return;
    }

    try {
      this.invoice = await this.billingApiService.getInvoiceDetail(invoiceId);
      this.paymentForm.patchValue({ paidAmount: this.invoice.balanceAmount || 0 });
    } catch {
      this.errorMessage = 'Unable to load invoice detail.';
    }
  }

  async recordPayment(): Promise<void> {
    if (!this.invoice || this.paymentForm.invalid) {
      return;
    }

    this.errorMessage = '';
    this.message = '';
    this.isRecordingPayment = true;

    try {
      const formValue = this.paymentForm.getRawValue();

      const payment = await this.billingApiService.recordPayment({
        invoiceId: this.invoice.invoiceId,
        paidAmount: Number(formValue.paidAmount),
        paymentMethod: formValue.paymentMethod ?? 'Upi',
        referenceNumber: formValue.referenceNumber ?? '',
        remarks: formValue.remarks ?? ''
      });

      await this.loadInvoice();
      this.message = payment.receipt
        ? `Payment recorded. Receipt ${payment.receipt.receiptNumber} generated successfully.`
        : 'Payment recorded successfully.';
    } catch {
      this.errorMessage = 'Unable to record payment for this invoice.';
    } finally {
      this.isRecordingPayment = false;
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  }
}
