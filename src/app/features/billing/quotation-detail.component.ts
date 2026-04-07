import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BillingApiService } from './billing-api.service';
import { QuotationDetailResponse } from './billing.models';

@Component({
  selector: 'app-customer-quotation-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page" *ngIf="quotation; else loadingState">
      <a routerLink="/my-bookings" class="back-link">← Back to My Bookings</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Quotation</p>
          <h2>{{ quotation.quotationNumber }}</h2>
          <p>{{ quotation.serviceName }} • {{ quotation.currentStatus }}</p>
          <small>{{ quotation.jobCardNumber }} • {{ quotation.bookingReference }}</small>
        </div>
        <div class="price">{{ currency(quotation.grandTotalAmount) }}</div>
      </div>

      <div class="summary-grid">
        <article>
          <h3>Commercial total</h3>
          <p>Subtotal: {{ currency(quotation.subTotalAmount) }}</p>
          <small>Discount: {{ currency(quotation.discountAmount) }}</small>
          <small>Tax: {{ quotation.taxPercentage }}% • {{ currency(quotation.taxAmount) }}</small>
        </article>
        <article>
          <h3>Status</h3>
          <p>{{ quotation.currentStatus }}</p>
          <small>{{ quotation.customerDecisionRemarks || 'No decision remarks recorded yet.' }}</small>
        </article>
        <article>
          <h3>Invoice</h3>
          <p>{{ quotation.invoiceNumber || 'Invoice not generated yet' }}</p>
          <a *ngIf="quotation.invoiceId" [routerLink]="['/my-invoices', quotation.invoiceId]">Open Invoice</a>
        </article>
      </div>

      <section class="actions-panel" *ngIf="quotation.currentStatus === 'PendingCustomerApproval'">
        <h3>Customer approval flow</h3>
        <textarea rows="3" [formControl]="remarksControl" placeholder="Optional approval or rejection note"></textarea>
        <div class="action-buttons">
          <button type="button" (click)="approveQuotation()" [disabled]="isSavingDecision">Approve Quotation</button>
          <button type="button" class="secondary" (click)="rejectQuotation()" [disabled]="isSavingDecision">Reject Quotation</button>
        </div>
      </section>

      <div class="detail-grid">
        <section>
          <h3>Quotation lines</h3>
          <div class="line-card" *ngFor="let line of quotation.lines">
            <strong>{{ line.lineDescription }}</strong>
            <p>{{ line.lineType }}</p>
            <small>{{ line.quantity }} × {{ currency(line.unitPrice) }} = {{ currency(line.lineAmount) }}</small>
          </div>
        </section>

        <section>
          <h3>Billing timeline</h3>
          <div class="history-card" *ngFor="let history of quotation.billingHistory">
            <strong>{{ history.entityType }} • {{ history.statusName }}</strong>
            <p>{{ history.remarks }}</p>
            <small>{{ history.changedBy }} • {{ history.statusDateUtc | date:'medium' }}</small>
          </div>
        </section>
      </div>

      <p class="message" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #loadingState>
      <section class="page">
        <p>{{ errorMessage || 'Loading quotation...' }}</p>
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
    article, section, .actions-panel { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    textarea { width: 100%; border: 1px solid var(--coolzo-border); border-radius: 14px; padding: 12px; font: inherit; resize: vertical; }
    .action-buttons { display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
    button, article a { width: fit-content; border: 0; border-radius: 999px; padding: 12px 18px; background: var(--coolzo-primary); color: white; font-weight: 700; text-decoration: none; cursor: pointer; }
    .secondary { background: white; color: var(--coolzo-primary-dark); border: 1px solid var(--coolzo-border); }
    .line-card, .history-card { padding: 14px; border-radius: 16px; background: #f9fffe; border: 1px solid var(--coolzo-border); margin-top: 12px; }
    p, small, h2, h3 { margin: 0; }
    .message { color: #166534; }
    .error { color: #be123c; }
  `]
})
export class QuotationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly billingApiService = inject(BillingApiService);

  quotation: QuotationDetailResponse | null = null;
  errorMessage = '';
  message = '';
  isSavingDecision = false;

  readonly remarksControl = this.formBuilder.control('');

  async ngOnInit(): Promise<void> {
    await this.loadQuotation();
  }

  async loadQuotation(): Promise<void> {
    const jobCardId = Number(this.route.snapshot.paramMap.get('jobCardId'));

    if (!jobCardId) {
      this.errorMessage = 'Invalid job card identifier.';
      return;
    }

    try {
      this.quotation = await this.billingApiService.getQuotationByJob(jobCardId);
    } catch {
      this.errorMessage = 'Quotation is not available for this booking yet.';
    }
  }

  async approveQuotation(): Promise<void> {
    await this.saveDecision('approve');
  }

  async rejectQuotation(): Promise<void> {
    await this.saveDecision('reject');
  }

  async saveDecision(action: 'approve' | 'reject'): Promise<void> {
    if (!this.quotation) {
      return;
    }

    this.errorMessage = '';
    this.message = '';
    this.isSavingDecision = true;

    try {
      this.quotation = action === 'approve'
        ? await this.billingApiService.approveQuotation(this.quotation.quotationId, this.remarksControl.value ?? '')
        : await this.billingApiService.rejectQuotation(this.quotation.quotationId, this.remarksControl.value ?? '');
      this.message = action === 'approve'
        ? 'Quotation approved successfully.'
        : 'Quotation rejected successfully.';
    } catch {
      this.errorMessage = action === 'approve'
        ? 'Unable to approve this quotation right now.'
        : 'Unable to reject this quotation right now.';
    } finally {
      this.isSavingDecision = false;
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  }
}
