import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentApiService } from './content-api.service';

@Component({
  selector: 'app-communication-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div>
        <h2>Communication Preferences</h2>
        <p>Control how Coolzo contacts you for booking confirmations, reminders, support follow-ups, and promotional updates.</p>
      </div>

      <form class="panel" [formGroup]="preferenceForm" (ngSubmit)="save()">
        <div class="grid">
          <label>
            Email Address
            <input type="email" formControlName="emailAddress" />
          </label>
          <label>
            Mobile Number
            <input type="text" formControlName="mobileNumber" />
          </label>
        </div>

        <div class="toggle-grid">
          <label class="toggle"><input type="checkbox" formControlName="emailEnabled" /> <span>Email notifications</span></label>
          <label class="toggle"><input type="checkbox" formControlName="smsEnabled" /> <span>SMS notifications</span></label>
          <label class="toggle"><input type="checkbox" formControlName="whatsAppEnabled" /> <span>WhatsApp notifications</span></label>
          <label class="toggle"><input type="checkbox" formControlName="pushEnabled" /> <span>Push notifications</span></label>
          <label class="toggle full"><input type="checkbox" formControlName="allowPromotionalContent" /> <span>Allow promotional messages</span></label>
        </div>

        <div class="actions">
          <button type="submit">Save Preferences</button>
          <small *ngIf="lastUpdated">Last updated {{ lastUpdated | date:'medium' }}</small>
        </div>
      </form>

      <p class="success" *ngIf="successMessage">{{ successMessage }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 18px; }
    .panel { display: grid; gap: 18px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: #fbfefd; }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .toggle-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .toggle { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 18px; border: 1px solid var(--coolzo-border); background: white; font-weight: 700; }
    .full { grid-column: 1 / -1; }
    label { display: grid; gap: 8px; font-weight: 700; }
    input[type='email'], input[type='text'] { width: 100%; padding: 11px 12px; border-radius: 14px; border: 1px solid var(--coolzo-border); }
    .actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    button { border: 0; border-radius: 999px; padding: 12px 18px; background: var(--coolzo-primary); color: white; font-weight: 700; cursor: pointer; }
    .success { color: #166534; margin: 0; }
    .error { color: #be123c; margin: 0; }
  `]
})
export class CommunicationPreferencesComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);
  private readonly formBuilder = inject(FormBuilder);

  successMessage = '';
  errorMessage = '';
  lastUpdated: string | null = null;

  readonly preferenceForm = this.formBuilder.group({
    emailAddress: ['', [Validators.email, Validators.maxLength(128)]],
    mobileNumber: ['', [Validators.pattern(/^[0-9]{0,16}$/)]],
    emailEnabled: [true, Validators.required],
    smsEnabled: [false, Validators.required],
    whatsAppEnabled: [false, Validators.required],
    pushEnabled: [false, Validators.required],
    allowPromotionalContent: [false, Validators.required]
  });

  async ngOnInit(): Promise<void> {
    await this.loadAsync();
  }

  async save(): Promise<void> {
    if (this.preferenceForm.invalid) {
      this.preferenceForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.contentApiService.updateMyCommunicationPreference(this.preferenceForm.getRawValue());
      this.lastUpdated = response.lastUpdated;
      this.successMessage = 'Communication preferences saved successfully.';
    } catch {
      this.errorMessage = 'Unable to save communication preferences right now.';
    }
  }

  private async loadAsync(): Promise<void> {
    this.errorMessage = '';

    try {
      const response = await this.contentApiService.getMyCommunicationPreference();
      this.lastUpdated = response.lastUpdated;
      this.preferenceForm.patchValue({
        emailAddress: response.emailAddress,
        mobileNumber: response.mobileNumber,
        emailEnabled: response.emailEnabled,
        smsEnabled: response.smsEnabled,
        whatsAppEnabled: response.whatsAppEnabled,
        pushEnabled: response.pushEnabled,
        allowPromotionalContent: response.allowPromotionalContent
      });
    } catch {
      this.errorMessage = 'Unable to load communication preferences right now.';
    }
  }
}
