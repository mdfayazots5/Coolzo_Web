import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingApiService } from '../booking/booking-api.service';
import { BookingDetailResponse } from '../booking/booking.models';
import { CancellationApiService } from './cancellation-api.service';
import { CancellationOptionsResponse } from './cancellation.models';

type CancellationReasonOption = {
  code: string;
  label: string;
};

const cancellationReasonOptions: CancellationReasonOption[] = [
  { code: 'PLANS_CHANGED', label: 'Plans changed' },
  { code: 'PRICE_CONCERN', label: 'Pricing concern' },
  { code: 'DUPLICATE_BOOKING', label: 'Duplicate booking' },
  { code: 'UNAVAILABLE', label: 'Not available at slot time' },
  { code: 'OTHER', label: 'Other reason' }
];

@Component({
  selector: 'app-cancellation-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page" *ngIf="booking && cancellationOptions; else loadingState">
      <a [routerLink]="['/my-bookings', booking.bookingId]" class="back-link">← Back to Booking Detail</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Cancellation Request</p>
          <h2>{{ booking.bookingReference }}</h2>
          <p>{{ booking.serviceName }} • {{ booking.slotDate }} • {{ booking.slotLabel }}</p>
        </div>
        <div class="hero-metrics">
          <strong>{{ currency(cancellationOptions.cancellationFee) }}</strong>
          <small>Expected fee</small>
        </div>
      </div>

      <section class="summary-grid">
        <article>
          <h3>Policy Preview</h3>
          <p>{{ cancellationOptions.policyName }}</p>
          <small>{{ cancellationOptions.policyDescription }}</small>
        </article>
        <article>
          <h3>Refund Estimate</h3>
          <p>{{ currency(cancellationOptions.refundEligibleAmount) }}</p>
          <small>{{ cancellationOptions.approvalRequired ? 'Approval may still be required before processing.' : 'No approval hold is expected.' }}</small>
        </article>
        <article>
          <h3>Scheduled Start</h3>
          <p>{{ cancellationOptions.scheduledStartUtc | date:'medium' }}</p>
          <small>{{ cancellationOptions.timeToSlotMinutes }} minutes to slot</small>
        </article>
      </section>

      <form class="panel" [formGroup]="form" (ngSubmit)="submitAsync()">
        <h3>Reason</h3>
        <label>
          Cancellation reason
          <select formControlName="cancellationReasonCode">
            <option value="">Select a reason</option>
            <option *ngFor="let reason of reasonOptions" [value]="reason.code">{{ reason.label }}</option>
          </select>
        </label>
        <label>
          Additional remarks
          <textarea formControlName="remarks" rows="4" placeholder="Share a few details so support can help if needed."></textarea>
        </label>
        <p class="hint" *ngIf="!cancellationOptions.canCustomerCancel">{{ cancellationOptions.customerDenialReason || 'Self-cancellation is currently unavailable.' }}</p>
        <div class="action-row">
          <button type="submit" [disabled]="isSubmitting || !cancellationOptions.canCustomerCancel || form.invalid">
            {{ isSubmitting ? 'Submitting...' : 'Confirm Cancellation' }}
          </button>
        </div>
      </form>

      <p class="message" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #loadingState>
      <section class="page">
        <p>{{ errorMessage || 'Loading cancellation options...' }}</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .back-link { color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .hero { display: flex; justify-content: space-between; gap: 18px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #fff8ee 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: #c2410c; }
    .hero-metrics { min-width: 140px; padding: 16px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; display: grid; gap: 6px; text-align: right; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    article, .panel { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    .panel { display: grid; gap: 14px; }
    label { display: grid; gap: 8px; font-weight: 700; }
    select, textarea { width: 100%; border-radius: 14px; border: 1px solid var(--coolzo-border); padding: 12px; font: inherit; }
    .action-row { display: flex; justify-content: flex-end; }
    button { border: 0; border-radius: 999px; padding: 12px 18px; background: #c2410c; color: white; font-weight: 700; cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: 0.6; }
    h2, h3, p, small { margin: 0; }
    .hint { color: #9a3412; }
    .message { color: #166534; }
    .error { color: #be123c; }
  `]
})
export class CancellationRequestComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly bookingApi = inject(BookingApiService);
  private readonly cancellationApi = inject(CancellationApiService);

  readonly reasonOptions = cancellationReasonOptions;
  readonly form = this.formBuilder.group({
    cancellationReasonCode: ['', Validators.required],
    remarks: ['', [Validators.required, Validators.maxLength(512)]]
  });

  booking: BookingDetailResponse | null = null;
  cancellationOptions: CancellationOptionsResponse | null = null;
  errorMessage = '';
  message = '';
  isSubmitting = false;

  async ngOnInit(): Promise<void> {
    const bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));

    if (!bookingId) {
      this.errorMessage = 'Invalid booking identifier.';
      return;
    }

    try {
      this.booking = await this.bookingApi.getBookingDetail(bookingId);
      this.cancellationOptions = await this.cancellationApi.getCancellationOptions(this.booking.serviceRequestId ?? 0, this.booking.bookingId);
    } catch {
      this.errorMessage = 'Unable to load cancellation guidance right now.';
    }
  }

  async submitAsync(): Promise<void> {
    if (!this.booking || !this.cancellationOptions || this.form.invalid) {
      return;
    }

    this.errorMessage = '';
    this.message = '';
    this.isSubmitting = true;

    try {
      const selectedReason = cancellationReasonOptions.find((reason) => reason.code === this.form.value.cancellationReasonCode);
      const cancellation = await this.cancellationApi.createCustomerCancellation({
        bookingId: this.booking.bookingId,
        serviceRequestId: this.booking.serviceRequestId,
        cancellationReasonCode: this.form.value.cancellationReasonCode ?? 'OTHER',
        cancellationReasonText: `${selectedReason?.label ?? 'Other'}: ${this.form.value.remarks?.trim() ?? ''}`.trim()
      });

      this.message = 'Cancellation submitted successfully.';

      if (cancellation.refundRequestId) {
        await this.router.navigate(['/refunds', cancellation.refundRequestId]);
        return;
      }

      await this.router.navigate(['/my-bookings', this.booking.bookingId]);
    } catch {
      this.errorMessage = 'Unable to submit the cancellation request right now.';
    } finally {
      this.isSubmitting = false;
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }
}
