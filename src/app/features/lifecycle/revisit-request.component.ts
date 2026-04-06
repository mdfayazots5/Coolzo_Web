import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LifecycleApiService } from './lifecycle-api.service';
import { RevisitRequestResponse } from './lifecycle.models';

@Component({
  selector: 'app-revisit-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <a [routerLink]="['/my-bookings', bookingId]" class="back-link">← Back to Booking</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Revisit Management</p>
          <h2 *ngIf="requests.length > 0">{{ requests[0].bookingReference }}</h2>
          <h2 *ngIf="requests.length === 0">Booking #{{ bookingId }}</h2>
          <p>Create a free or paid revisit linked to the original completed job card so support can continue the lifecycle correctly.</p>
        </div>
        <div class="summary-pill">
          {{ requests.length }} request{{ requests.length === 1 ? '' : 's' }}
        </div>
      </div>

      <section class="section-card">
        <h3>Raise Revisit Request</h3>
        <form class="request-form" [formGroup]="requestForm" (ngSubmit)="submitRequest()">
          <div class="row">
            <label>
              Original Job Card Id
              <input type="number" min="1" formControlName="originalJobCardId" />
            </label>
            <label>
              Revisit Type
              <select formControlName="revisitType">
                <option value="Paid">Paid</option>
                <option value="Warranty">Warranty</option>
                <option value="Amc">AMC</option>
              </select>
            </label>
          </div>

          <div class="row">
            <label>
              Preferred Visit Date
              <input type="date" formControlName="preferredVisitDateUtc" />
            </label>
            <label>
              Charge Amount
              <input type="number" min="0" step="0.01" formControlName="chargeAmount" />
            </label>
          </div>

          <div class="row">
            <label>
              Customer AMC Id
              <input type="number" min="1" formControlName="customerAmcId" />
            </label>
            <label>
              Warranty Claim Id
              <input type="number" min="1" formControlName="warrantyClaimId" />
            </label>
          </div>

          <label>
            Issue Summary
            <textarea rows="3" formControlName="issueSummary" placeholder="Describe what needs a follow-up visit"></textarea>
          </label>

          <label>
            Request Remarks
            <textarea rows="3" formControlName="requestRemarks" placeholder="Optional remarks for the revisit coordination team"></textarea>
          </label>

          <div class="guidance">
            <small *ngIf="requestForm.value.revisitType === 'Amc'">AMC revisit requires a valid Customer AMC Id and uses zero charge.</small>
            <small *ngIf="requestForm.value.revisitType === 'Warranty'">Warranty revisit requires a valid Warranty Claim Id and uses zero charge.</small>
            <small *ngIf="requestForm.value.revisitType === 'Paid'">Paid revisit requires a positive charge amount.</small>
          </div>

          <button type="submit" [disabled]="requestForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Submitting...' : 'Submit Revisit Request' }}
          </button>
        </form>
        <a
          [routerLink]="['/support-tickets/new']"
          [queryParams]="{
            linkedEntityType: requests.length > 0 ? 'RevisitRequest' : 'Booking',
            linkedEntityId: requests.length > 0 ? requests[0].revisitRequestId : bookingId,
            subject: requests.length > 0 ? 'Support needed for revisit request' : 'Support needed for revisit planning',
            linkLabel: requests.length > 0 ? ('Revisit #' + requests[0].revisitRequestId) : ('Booking #' + bookingId)
          }"
          class="support-link">
          Raise Support Ticket
        </a>
      </section>

      <section class="section-card">
        <h3>Existing Revisit Requests</h3>
        <div class="history-card" *ngFor="let request of requests">
          <div class="history-head">
            <strong>Request #{{ request.revisitRequestId }}</strong>
            <span>{{ request.currentStatus }}</span>
          </div>
          <p>{{ request.issueSummary }}</p>
          <small>{{ request.revisitType }} revisit linked to {{ request.originalJobCardNumber }}</small>
          <small>{{ request.requestedDateUtc | date:'medium' }}</small>
          <small *ngIf="request.preferredVisitDateUtc">Preferred visit: {{ request.preferredVisitDateUtc | date:'mediumDate' }}</small>
          <small *ngIf="request.customerAmcId">Customer AMC Id: {{ request.customerAmcId }}</small>
          <small *ngIf="request.warrantyClaimId">Warranty Claim Id: {{ request.warrantyClaimId }}</small>
          <small *ngIf="request.chargeAmount > 0">Charge amount: {{ currency(request.chargeAmount) }}</small>
        </div>
        <p *ngIf="requests.length === 0">No revisit requests have been raised for this booking yet.</p>
      </section>

      <p class="message" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .back-link { color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .hero { display: flex; justify-content: space-between; gap: 16px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #eefbf6 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .summary-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 120px; height: fit-content; padding: 12px 16px; border-radius: 999px; border: 1px solid var(--coolzo-border); background: white; font-weight: 700; }
    .section-card { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; display: grid; gap: 14px; }
    .request-form { display: grid; gap: 12px; }
    .row { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    label { display: grid; gap: 8px; font-weight: 700; }
    input, select, textarea { border: 1px solid var(--coolzo-border); border-radius: 14px; padding: 11px 12px; font: inherit; }
    button { width: fit-content; border: 0; border-radius: 999px; padding: 12px 18px; background: var(--coolzo-primary); color: white; font-weight: 700; cursor: pointer; }
    .guidance { padding: 12px; border-radius: 16px; background: #f9fffe; border: 1px dashed var(--coolzo-border); }
    .support-link { width: fit-content; color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .history-card { padding: 14px; border-radius: 16px; background: #f9fffe; border: 1px solid var(--coolzo-border); display: grid; gap: 6px; }
    .history-head { display: flex; justify-content: space-between; gap: 12px; }
    .history-head span { padding: 6px 10px; border-radius: 999px; background: rgba(15, 118, 110, 0.12); color: var(--coolzo-primary-dark); font-weight: 700; }
    p, small, h2, h3, strong { margin: 0; }
    .message { color: #166534; }
    .error { color: #be123c; }
  `]
})
export class RevisitRequestComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly lifecycleApiService = inject(LifecycleApiService);

  bookingId = 0;
  requests: RevisitRequestResponse[] = [];
  errorMessage = '';
  message = '';
  isSubmitting = false;

  readonly requestForm = this.formBuilder.group({
    originalJobCardId: [0, [Validators.required, Validators.min(1)]],
    revisitType: ['Paid', Validators.required],
    preferredVisitDateUtc: [''],
    issueSummary: ['', [Validators.required, Validators.maxLength(256)]],
    requestRemarks: [''],
    customerAmcId: [null as number | null],
    warrantyClaimId: [null as number | null],
    chargeAmount: [0]
  });

  ngOnInit(): void {
    this.bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));
    const queryJobCardId = Number(this.route.snapshot.queryParamMap.get('jobCardId'));

    if (queryJobCardId) {
      this.requestForm.patchValue({ originalJobCardId: queryJobCardId });
    }

    this.requestForm.get('revisitType')?.valueChanges.subscribe((revisitType) => {
      if (revisitType === 'Amc' || revisitType === 'Warranty') {
        this.requestForm.patchValue({ chargeAmount: 0 }, { emitEvent: false });
      }
    });

    void this.loadRequests();
  }

  async loadRequests(): Promise<void> {
    if (!this.bookingId) {
      this.errorMessage = 'Invalid booking identifier.';
      return;
    }

    try {
      this.requests = await this.lifecycleApiService.getRevisitByBooking(this.bookingId);
    } catch {
      this.errorMessage = 'Unable to load revisit requests right now.';
    }
  }

  async submitRequest(): Promise<void> {
    if (this.requestForm.invalid) {
      return;
    }

    this.errorMessage = '';
    this.message = '';
    this.isSubmitting = true;

    try {
      const formValue = this.requestForm.getRawValue();
      const revisitType = formValue.revisitType ?? 'Paid';

      await this.lifecycleApiService.createRevisit({
        originalJobCardId: Number(formValue.originalJobCardId),
        revisitType,
        preferredVisitDateUtc: formValue.preferredVisitDateUtc || null,
        issueSummary: formValue.issueSummary ?? '',
        requestRemarks: formValue.requestRemarks ?? '',
        customerAmcId: revisitType === 'Amc' && formValue.customerAmcId ? Number(formValue.customerAmcId) : null,
        warrantyClaimId: revisitType === 'Warranty' && formValue.warrantyClaimId ? Number(formValue.warrantyClaimId) : null,
        chargeAmount: revisitType === 'Paid' ? Number(formValue.chargeAmount ?? 0) : null
      });

      this.requestForm.patchValue({
        revisitType: 'Paid',
        preferredVisitDateUtc: '',
        issueSummary: '',
        requestRemarks: '',
        customerAmcId: null,
        warrantyClaimId: null,
        chargeAmount: 0
      });
      await this.loadRequests();
      this.message = 'Revisit request submitted successfully.';
    } catch {
      this.errorMessage = 'Unable to submit the revisit request right now.';
    } finally {
      this.isSubmitting = false;
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  }
}
