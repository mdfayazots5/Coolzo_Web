import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CancellationApiService } from './cancellation-api.service';
import { RefundDetailResponse } from './cancellation.models';

@Component({
  selector: 'app-refund-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page" *ngIf="refund; else loadingState">
      <a *ngIf="refund.cancellationRecordId" [routerLink]="['/my-bookings']" class="back-link">← Back to My Bookings</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Refund Status</p>
          <h2>{{ refund.refundRequestNo }}</h2>
          <p>{{ refund.refundStatus }} • {{ refund.refundMethod }} • {{ currency(refund.refundAmount) }}</p>
        </div>
        <div class="hero-chip">{{ refund.approvalRequired ? 'Approval flow' : 'Direct flow' }}</div>
      </div>

      <div class="summary-grid">
        <article>
          <h3>Amount</h3>
          <p>{{ currency(refund.refundAmount) }}</p>
          <small>Approved: {{ currency(refund.approvedAmount) }}</small>
        </article>
        <article>
          <h3>Reason</h3>
          <p>{{ refund.refundReason }}</p>
          <small>{{ refund.processedOn ? ('Processed ' + (refund.processedOn | date:'medium')) : 'Processing is still pending.' }}</small>
        </article>
      </div>

      <section class="timeline-panel">
        <h3>Status Timeline</h3>
        <div class="timeline-card" *ngFor="let item of refund.statusHistory">
          <strong>{{ item.toStatus }}</strong>
          <p>{{ item.remarks || (item.fromStatus + ' → ' + item.toStatus) }}</p>
          <small>{{ item.changedOn | date:'medium' }}</small>
        </div>
        <p *ngIf="refund.statusHistory.length === 0">Status updates will appear here as the refund workflow progresses.</p>
      </section>

      <section class="timeline-panel" *ngIf="refund.approvals.length > 0">
        <h3>Approval Trail</h3>
        <div class="timeline-card" *ngFor="let item of refund.approvals">
          <strong>Level {{ item.approvalLevel }} • {{ item.approvalStatus }}</strong>
          <p>{{ item.approvalRemarks || 'No remarks added.' }}</p>
          <small>{{ item.approvedOn ? (item.approvedOn | date:'medium') : 'Pending approval action' }}</small>
        </div>
      </section>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #loadingState>
      <section class="page">
        <p>{{ errorMessage || 'Loading refund status...' }}</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .back-link { color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .hero { display: flex; justify-content: space-between; gap: 16px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #eefcf8 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .hero-chip { align-self: start; padding: 10px 14px; border-radius: 999px; border: 1px solid var(--coolzo-border); background: white; font-weight: 700; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    article, .timeline-panel { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    .timeline-card { margin-top: 12px; padding: 14px; border-radius: 16px; border: 1px solid var(--coolzo-border); background: #f9fffe; }
    h2, h3, p, small, strong { margin: 0; }
    .error { color: #be123c; }
  `]
})
export class RefundStatusComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cancellationApi = inject(CancellationApiService);

  refund: RefundDetailResponse | null = null;
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    const refundRequestId = Number(this.route.snapshot.paramMap.get('refundRequestId'));

    if (!refundRequestId) {
      this.errorMessage = 'Invalid refund request identifier.';
      return;
    }

    try {
      this.refund = await this.cancellationApi.getRefundDetail(refundRequestId);
    } catch {
      this.errorMessage = 'Unable to load refund status right now.';
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }
}
