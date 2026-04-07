import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupportApiService } from './support-api.service';
import { LookupItemResponse } from './support.models';

@Component({
  selector: 'app-support-ticket-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <a routerLink="/support-tickets" class="back-link">← Back to My Support Tickets</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Create Support Ticket</p>
          <h2>Raise a new issue with the support team</h2>
          <p>Use this for operational follow-up, billing issues, AMC support, warranty continuity, or revisit coordination.</p>
        </div>
        <div class="link-pill">{{ linkCaption }}</div>
      </div>

      <section class="section-card">
        <h3>Ticket details</h3>
        <form class="ticket-form" [formGroup]="ticketForm" (ngSubmit)="submit()">
          <div class="row">
            <label>
              Subject
              <input type="text" formControlName="subject" placeholder="What do you need help with?" />
            </label>
            <label>
              Category
              <select formControlName="categoryId">
                <option value="">Select category</option>
                <option *ngFor="let category of categories" [value]="category.value">{{ category.label }}</option>
              </select>
            </label>
            <label>
              Priority
              <select formControlName="priorityId">
                <option value="">Select priority</option>
                <option *ngFor="let priority of priorities" [value]="priority.value">{{ priority.label }}</option>
              </select>
            </label>
          </div>

          <label>
            Description
            <textarea rows="6" formControlName="description" placeholder="Share the issue, any steps already taken, and the outcome you need."></textarea>
          </label>

          <div class="linked-card" *ngIf="linkedEntityType && linkedEntityId">
            <strong>Linked record</strong>
            <p>{{ linkCaption }}</p>
            <small>This ticket will be created with the selected business link already attached.</small>
          </div>

          <button type="submit" [disabled]="ticketForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Submitting...' : 'Create Support Ticket' }}
          </button>
        </form>
      </section>

      <p class="message" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .back-link { color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .hero { display: flex; justify-content: space-between; gap: 16px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #eafaf7 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .link-pill { height: fit-content; padding: 14px 18px; border-radius: 999px; border: 1px solid var(--coolzo-border); background: white; font-weight: 700; }
    .section-card { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; display: grid; gap: 14px; }
    .ticket-form { display: grid; gap: 14px; }
    .row { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    label { display: grid; gap: 8px; font-weight: 700; }
    input, select, textarea { border: 1px solid var(--coolzo-border); border-radius: 14px; padding: 11px 12px; font: inherit; }
    button { width: fit-content; border: 0; border-radius: 999px; padding: 12px 18px; background: var(--coolzo-primary); color: white; font-weight: 700; cursor: pointer; }
    .linked-card { padding: 14px; border-radius: 16px; border: 1px dashed var(--coolzo-border); background: #f9fffe; display: grid; gap: 6px; }
    p, small, h2, h3, strong { margin: 0; }
    .message { color: #166534; }
    .error { color: #be123c; }
  `]
})
export class SupportTicketCreateComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly supportApiService = inject(SupportApiService);

  categories: LookupItemResponse[] = [];
  priorities: LookupItemResponse[] = [];
  linkedEntityType: string | null = null;
  linkedEntityId: number | null = null;
  linkLabel = '';
  errorMessage = '';
  message = '';
  isSubmitting = false;

  readonly ticketForm = this.formBuilder.group({
    subject: ['', [Validators.required, Validators.maxLength(128)]],
    categoryId: ['', Validators.required],
    priorityId: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(1024)]]
  });

  get linkCaption(): string {
    return this.linkLabel || (this.linkedEntityType && this.linkedEntityId ? `${this.linkedEntityType} #${this.linkedEntityId}` : 'Standalone ticket');
  }

  async ngOnInit(): Promise<void> {
    this.linkedEntityType = this.route.snapshot.queryParamMap.get('linkedEntityType');
    this.linkedEntityId = Number(this.route.snapshot.queryParamMap.get('linkedEntityId') || 0) || null;
    this.linkLabel = this.route.snapshot.queryParamMap.get('linkLabel') || '';

    const subject = this.route.snapshot.queryParamMap.get('subject');

    if (subject) {
      this.ticketForm.patchValue({ subject });
    }

    try {
      const [categories, priorities] = await Promise.all([
        this.supportApiService.getCategories(),
        this.supportApiService.getPriorities()
      ]);

      this.categories = categories;
      this.priorities = priorities;
    } catch {
      this.errorMessage = 'Unable to load support ticket lookups.';
    }
  }

  async submit(): Promise<void> {
    if (this.ticketForm.invalid) {
      return;
    }

    this.errorMessage = '';
    this.message = '';
    this.isSubmitting = true;

    try {
      const formValue = this.ticketForm.getRawValue();
      const detail = await this.supportApiService.createTicket({
        customerId: null,
        subject: formValue.subject ?? '',
        categoryId: Number(formValue.categoryId),
        priorityId: Number(formValue.priorityId),
        description: formValue.description ?? '',
        links: this.linkedEntityType && this.linkedEntityId
          ? [{ linkedEntityType: this.linkedEntityType, linkedEntityId: this.linkedEntityId }]
          : []
      });

      this.message = 'Support ticket created successfully.';
      await this.router.navigate(['/support-tickets', detail.supportTicketId]);
    } catch {
      this.errorMessage = 'Unable to create the support ticket right now.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
