import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InstallationApiService } from './installation-api.service';
import { InstallationSummaryResponse } from './installation.models';

@Component({
  selector: 'app-installation-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <section class="hero">
        <div class="copy">
          <p class="eyebrow">Installation Desk</p>
          <h1>Request a new AC installation survey</h1>
          <p>Send the installation brief directly into the GAP PHASE C pipeline so the team can schedule survey, prepare proposal, and move to execution without mixing it into repair bookings.</p>
          <div class="actions">
            <a routerLink="/booking">Book a Service</a>
            <a routerLink="/home" class="secondary">Back To Home</a>
          </div>
        </div>
        <div class="card">
          <strong>What happens next</strong>
          <p>Your request becomes an installation record, a survey slot can be assigned, and the commercial proposal appears in your customer portal once prepared.</p>
        </div>
      </section>

      <form class="form-card" [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid">
          <label>
            Customer Name
            <input type="text" formControlName="customerName" placeholder="Your name" />
          </label>
          <label>
            Mobile Number
            <input type="text" formControlName="mobileNumber" placeholder="9999999999" />
          </label>
          <label>
            Email Address
            <input type="email" formControlName="emailAddress" placeholder="optional@email.com" />
          </label>
          <label>
            Installation Type
            <input type="text" formControlName="installationType" placeholder="Split AC / Cassette / Multi-split" />
          </label>
          <label>
            Number Of Units
            <input type="number" min="1" formControlName="numberOfUnits" />
          </label>
          <label>
            Preferred Survey Date
            <input type="datetime-local" formControlName="preferredSurveyDateUtc" />
          </label>
          <label class="wide">
            Address Line 1
            <input type="text" formControlName="addressLine1" placeholder="Site address" />
          </label>
          <label class="wide">
            Address Line 2
            <input type="text" formControlName="addressLine2" placeholder="Landmark or unit details" />
          </label>
          <label>
            City
            <input type="text" formControlName="cityName" />
          </label>
          <label>
            Pincode
            <input type="text" formControlName="pincode" />
          </label>
          <label class="wide">
            Site Notes
            <textarea rows="5" formControlName="siteNotes" placeholder="Pipe run estimate, floor level, electrical readiness, or access notes."></textarea>
          </label>
        </div>
        <div class="submit-row">
          <button type="submit" [disabled]="isSubmitting">{{ isSubmitting ? 'Submitting...' : 'Submit Installation Request' }}</button>
          <p class="hint">Customer name, mobile, address, installation type, and unit count are required.</p>
        </div>
      </form>

      <section class="success-card" *ngIf="createdInstallation as installation">
        <p class="eyebrow">Installation Created</p>
        <h2>{{ installation.installationNumber }}</h2>
        <p>Status: {{ installation.installationStatus }} • Approval: {{ installation.approvalStatus }}</p>
        <div class="actions">
          <a routerLink="/login">Customer Login</a>
          <a routerLink="/home" class="secondary">Back To Home</a>
        </div>
      </section>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 24px; max-width: 1120px; margin: 0 auto; padding: 24px; }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
      gap: 20px;
      padding: 28px;
      border-radius: 28px;
      border: 1px solid var(--coolzo-border);
      background: linear-gradient(135deg, #ddf4ee 0%, #ffffff 54%, #edf7ff 100%);
    }
    .copy { display: grid; gap: 14px; }
    .eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    h1, h2, p, strong { margin: 0; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .actions a, button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 18px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      background: var(--coolzo-primary);
      color: white;
      border: 0;
      cursor: pointer;
    }
    .actions a.secondary {
      background: white;
      color: var(--coolzo-primary-dark);
      border: 1px solid var(--coolzo-border);
    }
    .card, .form-card, .success-card {
      border-radius: 24px;
      border: 1px solid var(--coolzo-border);
      background: white;
    }
    .card, .success-card { padding: 22px; display: grid; gap: 10px; align-content: start; }
    .form-card { padding: 24px; display: grid; gap: 18px; }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .wide { grid-column: 1 / -1; }
    label { display: grid; gap: 8px; font-weight: 700; color: var(--coolzo-primary-dark); }
    input, textarea {
      width: 100%;
      border: 1px solid var(--coolzo-border);
      border-radius: 16px;
      padding: 12px 14px;
      background: #f7fcfb;
      font: inherit;
    }
    textarea { resize: vertical; min-height: 120px; }
    .submit-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: center; }
    .hint { color: var(--coolzo-primary-dark); opacity: 0.8; }
    .error { color: #b91c1c; margin: 0; }
    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; }
      .submit-row { align-items: flex-start; flex-direction: column; }
    }
  `]
})
export class InstallationRequestComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly installationApiService = inject(InstallationApiService);

  createdInstallation: InstallationSummaryResponse | null = null;
  errorMessage = '';
  isSubmitting = false;

  readonly form = this.formBuilder.group({
    customerName: [''],
    mobileNumber: [''],
    emailAddress: [''],
    addressLine1: [''],
    addressLine2: [''],
    cityName: [''],
    pincode: [''],
    installationType: ['Split AC'],
    numberOfUnits: [1],
    siteNotes: [''],
    preferredSurveyDateUtc: ['']
  });

  async submit(): Promise<void> {
    if (
      !this.form.value.customerName?.trim()
      || !this.form.value.mobileNumber?.trim()
      || !this.form.value.addressLine1?.trim()
      || !this.form.value.cityName?.trim()
      || !this.form.value.pincode?.trim()
      || !this.form.value.installationType?.trim()
    ) {
      this.errorMessage = 'Please complete the required customer and installation fields.';
      return;
    }

    this.errorMessage = '';
    this.createdInstallation = null;
    this.isSubmitting = true;

    try {
      this.createdInstallation = await this.installationApiService.createInstallation({
        leadId: null,
        customerName: this.form.value.customerName.trim(),
        mobileNumber: this.form.value.mobileNumber.trim(),
        emailAddress: this.form.value.emailAddress?.trim() || null,
        sourceChannel: 'Website',
        addressLine1: this.form.value.addressLine1.trim(),
        addressLine2: this.form.value.addressLine2?.trim() || null,
        cityName: this.form.value.cityName.trim(),
        pincode: this.form.value.pincode.trim(),
        installationType: this.form.value.installationType.trim(),
        numberOfUnits: Number(this.form.value.numberOfUnits ?? 1),
        siteNotes: this.form.value.siteNotes?.trim() || null,
        preferredSurveyDateUtc: this.form.value.preferredSurveyDateUtc
          ? new Date(this.form.value.preferredSurveyDateUtc).toISOString()
          : null
      });

      this.form.patchValue({
        customerName: '',
        mobileNumber: '',
        emailAddress: '',
        addressLine1: '',
        addressLine2: '',
        cityName: '',
        pincode: '',
        installationType: 'Split AC',
        numberOfUnits: 1,
        siteNotes: '',
        preferredSurveyDateUtc: ''
      });
    } catch {
      this.errorMessage = 'Unable to submit the installation request right now.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
