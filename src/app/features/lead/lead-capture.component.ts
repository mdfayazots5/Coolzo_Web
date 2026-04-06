import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadApiService } from './lead-api.service';
import { LeadResponse } from './lead.models';

@Component({
  selector: 'app-lead-capture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <section class="hero">
        <div class="copy">
          <p class="eyebrow">Inquiry Desk</p>
          <h1>Request a callback before you book</h1>
          <p>Use this lightweight inquiry form for installation questions, service planning, or premium support follow-up when you want the team to call first.</p>
          <div class="actions">
            <a routerLink="/booking">Book a Service</a>
            <a routerLink="/faq" class="secondary">Read FAQs</a>
          </div>
        </div>
        <div class="card">
          <strong>Response promise</strong>
          <p>New website leads are routed into the admin inbox so customer support can qualify, assign, and convert them into bookings or service requests.</p>
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
            Source Channel
            <select formControlName="sourceChannel">
              <option value="Website">Website</option>
              <option value="Phone">Phone</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="App">App</option>
            </select>
          </label>
          <label class="wide">
            Address Line 1
            <input type="text" formControlName="addressLine1" placeholder="Optional service address" />
          </label>
          <label>
            City
            <input type="text" formControlName="cityName" placeholder="Optional city" />
          </label>
          <label>
            Pincode
            <input type="text" formControlName="pincode" placeholder="Optional pincode" />
          </label>
          <label class="wide">
            Inquiry Notes
            <textarea rows="5" formControlName="inquiryNotes" placeholder="Tell us what you need help with, preferred callback timing, or installation details."></textarea>
          </label>
        </div>
        <div class="submit-row">
          <button type="submit" [disabled]="isSubmitting">{{ isSubmitting ? 'Submitting...' : 'Submit Inquiry' }}</button>
          <p class="hint">Mobile number and source channel are mandatory for the lead pipeline.</p>
        </div>
      </form>

      <section class="success-card" *ngIf="createdLead as lead">
        <p class="eyebrow">Lead Created</p>
        <h2>{{ lead.leadNumber }}</h2>
        <p>Your inquiry is now in the lead inbox. A support executive can qualify it and convert it into the right operational flow.</p>
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
      background: linear-gradient(135deg, #d9f6f0 0%, #ffffff 58%, #eef9f7 100%);
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
    input, select, textarea {
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
export class LeadCaptureComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly leadApiService = inject(LeadApiService);

  createdLead: LeadResponse | null = null;
  errorMessage = '';
  isSubmitting = false;

  readonly form = this.formBuilder.group({
    customerName: [''],
    mobileNumber: [''],
    emailAddress: [''],
    sourceChannel: ['Website'],
    addressLine1: [''],
    cityName: [''],
    pincode: [''],
    inquiryNotes: ['']
  });

  async submit(): Promise<void> {
    if (!this.form.value.customerName?.trim() || !this.form.value.mobileNumber?.trim()) {
      this.errorMessage = 'Customer name and mobile number are required.';
      return;
    }

    this.errorMessage = '';
    this.createdLead = null;
    this.isSubmitting = true;

    try {
      this.createdLead = await this.leadApiService.createLead({
        customerName: this.form.value.customerName?.trim(),
        mobileNumber: this.form.value.mobileNumber?.trim(),
        emailAddress: this.form.value.emailAddress?.trim() || null,
        sourceChannel: this.form.value.sourceChannel || 'Website',
        addressLine1: this.form.value.addressLine1?.trim() || null,
        addressLine2: null,
        cityName: this.form.value.cityName?.trim() || null,
        pincode: this.form.value.pincode?.trim() || null,
        serviceId: null,
        acTypeId: null,
        tonnageId: null,
        brandId: null,
        slotAvailabilityId: null,
        inquiryNotes: this.form.value.inquiryNotes?.trim() || null
      });
      this.form.patchValue({
        customerName: '',
        mobileNumber: '',
        emailAddress: '',
        sourceChannel: 'Website',
        addressLine1: '',
        cityName: '',
        pincode: '',
        inquiryNotes: ''
      });
    } catch {
      this.errorMessage = 'Unable to submit the inquiry right now.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
