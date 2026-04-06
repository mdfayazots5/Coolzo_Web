import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingApiService } from '../booking/booking-api.service';
import { BookingDetailResponse } from '../booking/booking.models';
import { CancellationApiService } from '../cancellations/cancellation-api.service';
import { CancellationDetailResponse, CancellationOptionsResponse } from '../cancellations/cancellation.models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page" *ngIf="booking; else loadingState">
      <a routerLink="/my-bookings" class="back-link">← Back to My Bookings</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Booking Reference</p>
          <h2>{{ booking.bookingReference }}</h2>
          <p>{{ booking.serviceName }} • {{ booking.status }} • {{ booking.slotDate }} • {{ booking.slotLabel }}</p>
        </div>
        <div class="price">{{ currency(booking.estimatedPrice) }}</div>
      </div>

      <div class="grid">
        <article>
          <h3>Customer</h3>
          <p>{{ booking.customerName }}</p>
          <small>{{ booking.mobileNumber }} • {{ booking.emailAddress || 'No email provided' }}</small>
        </article>
        <article>
          <h3>Address</h3>
          <p>{{ booking.addressSummary }}</p>
          <small>{{ booking.zoneName }}</small>
        </article>
        <article>
          <h3>Source</h3>
          <p>{{ booking.sourceChannel }}</p>
          <small>{{ booking.isGuestBooking ? 'Guest booking' : 'Customer booking' }}</small>
        </article>
        <article>
          <h3>Operations</h3>
          <p>{{ booking.operationalStatus || 'Awaiting service request creation' }}</p>
          <small>{{ booking.assignedTechnicianName || 'No technician assigned yet' }}</small>
          <small>{{ booking.jobCardNumber || 'Job card will appear once field execution starts' }}</small>
        </article>
        <article>
          <h3>Billing</h3>
          <p>{{ booking.quotationNumber || 'Quotation pending' }}</p>
          <small>{{ booking.quotationStatus || 'Awaiting technician commercial estimate' }}</small>
          <small>{{ booking.invoiceNumber || 'Invoice not generated yet' }}</small>
          <small *ngIf="booking.invoiceId">{{ booking.invoiceStatus }} • {{ currency(booking.invoiceBalanceAmount || 0) }} due</small>
        </article>
      </div>

      <section class="operations-panel">
        <h3>Cancellation & Refund</h3>
        <p *ngIf="cancellation; else cancellationPreview">
          {{ cancellation.cancellationStatus }} • Fee {{ currency(cancellation.cancellationFee) }} • Refund {{ currency(cancellation.refundEligibleAmount) }}
        </p>
        <ng-template #cancellationPreview>
          <p *ngIf="cancellationOptions; else previewPending">
            {{ cancellationOptions.policyName }} • Fee {{ currency(cancellationOptions.cancellationFee) }} • Refund {{ currency(cancellationOptions.refundEligibleAmount) }}
          </p>
        </ng-template>
        <ng-template #previewPending>
          <p>Cancellation guidance will appear once the slot and service request context are available.</p>
        </ng-template>
        <small *ngIf="cancellationOptions && !cancellationOptions.canCustomerCancel && !cancellation">
          {{ cancellationOptions.customerDenialReason || 'Self-cancellation is not available right now.' }}
        </small>
        <div class="billing-actions">
          <a
            *ngIf="cancellationOptions?.canCustomerCancel && !cancellation"
            [routerLink]="['/my-bookings', booking.bookingId, 'cancel']"
            class="billing-link">
            Request Cancellation
          </a>
          <a
            *ngIf="cancellation?.refundRequestId"
            [routerLink]="['/refunds', cancellation.refundRequestId]"
            class="billing-link secondary-link">
            View Refund Status
          </a>
        </div>
      </section>

      <section class="operations-panel">
        <h3>Operational Tracking</h3>
        <p *ngIf="booking.serviceRequestNumber; else pendingState">
          {{ booking.serviceRequestNumber }} is active and the latest field status is {{ booking.operationalStatus }}.
        </p>
        <ng-template #pendingState>
          <p>Your booking has been confirmed and will move into operations once a service request is created by the support team.</p>
        </ng-template>
        <p *ngIf="booking.completionSummary">{{ booking.completionSummary }}</p>
        <div class="billing-actions">
          <a *ngIf="booking.jobCardId" [routerLink]="['/quotations/job', booking.jobCardId]" class="billing-link">Open Quotation</a>
          <a *ngIf="booking.invoiceId" [routerLink]="['/my-invoices', booking.invoiceId]" class="billing-link secondary-link">Open Invoice</a>
          <a
            *ngIf="booking.jobCardId"
            [routerLink]="['/revisit/booking', booking.bookingId]"
            [queryParams]="{ jobCardId: booking.jobCardId }"
            class="billing-link secondary-link">
            Request Revisit
          </a>
          <a
            [routerLink]="['/support-tickets/new']"
            [queryParams]="{
              linkedEntityType: 'Booking',
              linkedEntityId: booking.bookingId,
              subject: 'Support needed for booking ' + booking.bookingReference,
              linkLabel: booking.bookingReference
            }"
            class="billing-link secondary-link">
            Raise Support Ticket
          </a>
        </div>
      </section>

      <div class="detail-grid">
        <section>
          <h3>Equipment and Service Line</h3>
          <div class="line-card" *ngFor="let line of booking.lines">
            <strong>{{ line.serviceName }}</strong>
            <p>{{ line.acTypeName }} • {{ line.tonnageName }} • {{ line.brandName }}</p>
            <small>{{ line.modelName || 'No model' }} • {{ line.issueNotes || 'No issue notes' }}</small>
          </div>
        </section>

        <section>
          <h3>Live Field Timeline</h3>
          <div class="history-card" *ngFor="let history of booking.fieldTimeline">
            <strong>{{ history.eventTitle }}</strong>
            <p>{{ history.status }}</p>
            <small>{{ history.eventDateUtc | date:'medium' }}</small>
          </div>
          <p *ngIf="booking.fieldTimeline.length === 0">Field execution timeline will appear after technician updates begin.</p>
        </section>

        <section>
          <h3>Technician Notes</h3>
          <div class="history-card" *ngFor="let note of booking.customerVisibleNotes">
            <strong>{{ note.createdBy }}</strong>
            <p>{{ note.noteText }}</p>
            <small>{{ note.noteDateUtc | date:'medium' }}</small>
          </div>
          <p *ngIf="booking.customerVisibleNotes.length === 0">No customer-visible technician notes shared yet.</p>
        </section>
      </div>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #loadingState>
      <section class="page">
        <p>{{ errorMessage || 'Loading booking detail...' }}</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .back-link { color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #eafaf7 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .price { padding: 14px 18px; border-radius: 999px; background: white; border: 1px solid var(--coolzo-border); font-weight: 700; }
    .grid, .detail-grid { display: grid; gap: 16px; }
    .grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .detail-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    article, section, .operations-panel { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    .billing-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
    .billing-link { display: inline-flex; width: fit-content; padding: 10px 16px; border-radius: 999px; text-decoration: none; color: white; background: var(--coolzo-primary); font-weight: 700; }
    .secondary-link { background: white; color: var(--coolzo-primary-dark); border: 1px solid var(--coolzo-border); }
    .line-card, .history-card { padding: 14px; border-radius: 16px; background: #f9fffe; border: 1px solid var(--coolzo-border); margin-top: 12px; }
    p, small, h2, h3 { margin: 0; }
    .error { color: #be123c; }
  `]
})
export class BookingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookingApi = inject(BookingApiService);
  private readonly cancellationApi = inject(CancellationApiService);

  booking: BookingDetailResponse | null = null;
  cancellationOptions: CancellationOptionsResponse | null = null;
  cancellation: CancellationDetailResponse | null = null;
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    const bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));

    if (!bookingId) {
      this.errorMessage = 'Invalid booking identifier.';
      return;
    }

    try {
      this.booking = await this.bookingApi.getBookingDetail(bookingId);
      await this.loadCancellationDataAsync();
    } catch {
      this.errorMessage = 'Unable to load booking detail right now.';
    }
  }

  private async loadCancellationDataAsync(): Promise<void> {
    if (!this.booking) {
      return;
    }

    try {
      this.cancellation = await this.cancellationApi.getCancellationByBooking(this.booking.bookingId, this.booking.serviceRequestId ?? undefined);
      this.cancellationOptions = await this.cancellationApi.getCancellationOptions(this.booking.serviceRequestId ?? 0, this.booking.bookingId);
    } catch {
      this.cancellationOptions = null;
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }
}
