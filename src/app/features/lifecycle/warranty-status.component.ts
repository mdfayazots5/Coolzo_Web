import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LifecycleApiService } from './lifecycle-api.service';
import { WarrantyStatusResponse } from './lifecycle.models';

@Component({
  selector: 'app-warranty-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page" *ngIf="warranty; else loadingState">
      <a [routerLink]="['/my-invoices', warranty.invoiceId]" class="back-link">← Back to Invoice</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Warranty Status</p>
          <h2>{{ warranty.invoiceNumber }}</h2>
          <p>{{ warranty.serviceName }}</p>
          <small>{{ warranty.eligibilityMessage }}</small>
        </div>
        <div class="hero-pill" [class.hero-pill-active]="warranty.isEligible">
          {{ warranty.isEligible ? 'Eligible' : 'Not Eligible' }}
        </div>
      </div>

      <div class="summary-grid">
        <article>
          <h3>Coverage Window</h3>
          <p>{{ warranty.coverageStartDateUtc ? (warranty.coverageStartDateUtc | date:'mediumDate') : 'Not available' }}</p>
          <small>{{ warranty.coverageEndDateUtc ? ('Until ' + (warranty.coverageEndDateUtc | date:'mediumDate')) : 'No active warranty rule found.' }}</small>
        </article>
        <article>
          <h3>Rule Match</h3>
          <p>{{ warranty.warrantyRuleName || 'No warranty rule linked' }}</p>
          <small>{{ warranty.isWarrantyAvailable ? 'Warranty rule exists for this service combination.' : 'Warranty is not configured for this invoice.' }}</small>
        </article>
        <article>
          <h3>Claims Raised</h3>
          <p>{{ warranty.claims.length }}</p>
          <small>{{ hasOpenClaim ? 'An active claim is already in progress.' : 'No active claim is blocking a new request.' }}</small>
        </article>
      </div>

      <section class="section-card">
        <h3>Raise Warranty Claim</h3>
        <p>Use this when the invoice is still inside the valid warranty period and the issue needs a follow-up visit without paid revisit charges.</p>
        <form class="claim-form" [formGroup]="claimForm" (ngSubmit)="submitClaim()">
          <label>
            Claim Remarks
            <textarea rows="4" formControlName="claimRemarks" placeholder="Describe the issue you need covered under warranty"></textarea>
          </label>
          <button type="submit" [disabled]="isSubmitting || !warranty.isEligible || !warranty.isWarrantyAvailable || hasOpenClaim">
            {{ isSubmitting ? 'Submitting...' : 'Submit Warranty Claim' }}
          </button>
        </form>
        <a
          [routerLink]="['/support-tickets/new']"
          [queryParams]="{
            linkedEntityType: warranty.claims.length > 0 ? 'WarrantyClaim' : 'Invoice',
            linkedEntityId: warranty.claims.length > 0 ? warranty.claims[0].warrantyClaimId : warranty.invoiceId,
            subject: 'Support needed for warranty on ' + warranty.invoiceNumber,
            linkLabel: warranty.claims.length > 0 ? ('Claim #' + warranty.claims[0].warrantyClaimId) : warranty.invoiceNumber
          }"
          class="support-link">
          Raise Support Ticket
        </a>
      </section>

      <section class="section-card">
        <h3>Claim History</h3>
        <div class="history-card" *ngFor="let claim of warranty.claims">
          <div class="history-head">
            <strong>Claim #{{ claim.warrantyClaimId }}</strong>
            <span>{{ claim.currentStatus }}</span>
          </div>
          <p>{{ claim.claimRemarks || 'No remarks provided.' }}</p>
          <small>{{ claim.claimDateUtc | date:'medium' }}</small>
          <small *ngIf="claim.revisitRequestId">Revisit request linked: #{{ claim.revisitRequestId }}</small>
        </div>
        <p *ngIf="warranty.claims.length === 0">No warranty claims have been raised for this invoice yet.</p>
      </section>

      <p class="message" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #loadingState>
      <section class="page">
        <p>{{ errorMessage || 'Loading warranty status...' }}</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .back-link { color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .hero { display: flex; justify-content: space-between; gap: 16px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #f5fffd 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .hero-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 120px; height: fit-content; padding: 12px 16px; border-radius: 999px; border: 1px solid #fecaca; background: #fff1f2; color: #be123c; font-weight: 700; }
    .hero-pill-active { border-color: #bbf7d0; background: #f0fdf4; color: #166534; }
    .summary-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .section-card, article { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; display: grid; gap: 10px; }
    .claim-form { display: grid; gap: 12px; }
    label { display: grid; gap: 8px; font-weight: 700; }
    textarea { border: 1px solid var(--coolzo-border); border-radius: 14px; padding: 11px 12px; font: inherit; }
    button { width: fit-content; border: 0; border-radius: 999px; padding: 12px 18px; background: var(--coolzo-primary); color: white; font-weight: 700; cursor: pointer; }
    .support-link { width: fit-content; color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .history-card { padding: 14px; border-radius: 16px; background: #f9fffe; border: 1px solid var(--coolzo-border); display: grid; gap: 6px; }
    .history-head { display: flex; justify-content: space-between; gap: 12px; }
    .history-head span { padding: 6px 10px; border-radius: 999px; background: rgba(15, 118, 110, 0.12); color: var(--coolzo-primary-dark); font-weight: 700; }
    p, small, h2, h3, strong { margin: 0; }
    .message { color: #166534; }
    .error { color: #be123c; }
  `]
})
export class WarrantyStatusComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly lifecycleApiService = inject(LifecycleApiService);

  warranty: WarrantyStatusResponse | null = null;
  errorMessage = '';
  message = '';
  isSubmitting = false;

  readonly claimForm = this.formBuilder.group({
    claimRemarks: ['']
  });

  get hasOpenClaim(): boolean {
    return this.warranty?.claims.some((claim) => !['Rejected', 'Closed'].includes(claim.currentStatus)) ?? false;
  }

  async ngOnInit(): Promise<void> {
    await this.loadWarranty();
  }

  async loadWarranty(): Promise<void> {
    const invoiceId = Number(this.route.snapshot.paramMap.get('invoiceId'));

    if (!invoiceId) {
      this.errorMessage = 'Invalid invoice identifier.';
      return;
    }

    try {
      this.warranty = await this.lifecycleApiService.getWarrantyByInvoice(invoiceId);
    } catch {
      this.errorMessage = 'Unable to load warranty status.';
    }
  }

  async submitClaim(): Promise<void> {
    if (!this.warranty || this.hasOpenClaim) {
      return;
    }

    this.errorMessage = '';
    this.message = '';
    this.isSubmitting = true;

    try {
      const remarks = this.claimForm.getRawValue().claimRemarks ?? '';
      await this.lifecycleApiService.createWarrantyClaim(this.warranty.invoiceId, remarks);
      this.claimForm.reset({ claimRemarks: '' });
      await this.loadWarranty();
      this.message = 'Warranty claim submitted successfully.';
    } catch {
      this.errorMessage = 'Unable to submit the warranty claim right now.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
