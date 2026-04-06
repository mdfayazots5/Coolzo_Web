import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupportApiService } from './support-api.service';
import { SupportTicketDetailResponse } from './support.models';

@Component({
  selector: 'app-support-ticket-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page" *ngIf="ticket; else loadingState">
      <a routerLink="/support-tickets" class="back-link">← Back to My Support Tickets</a>

      <div class="hero">
        <div>
          <p class="eyebrow">Support Ticket</p>
          <h2>{{ ticket.ticketNumber }}</h2>
          <p>{{ ticket.subject }} • {{ ticket.status }}</p>
        </div>
        <div class="pill">{{ ticket.priorityName }}</div>
      </div>

      <div class="grid">
        <article>
          <h3>Description</h3>
          <p>{{ ticket.description }}</p>
        </article>
        <article>
          <h3>Current owner</h3>
          <p>{{ ticket.assignedOwnerName || 'Support queue' }}</p>
          <small>{{ ticket.categoryName }}</small>
        </article>
      </div>

      <div class="detail-grid">
        <section>
          <h3>Linked record summary</h3>
          <div class="line-card" *ngFor="let link of ticket.links">
            <strong>{{ link.linkedEntityType }}</strong>
            <p>{{ link.linkReference }}</p>
            <small>{{ link.linkSummary }}</small>
          </div>
          <p *ngIf="ticket.links.length === 0">This ticket was created without a linked business record.</p>
        </section>

        <section>
          <h3>Replies</h3>
          <div class="history-card" *ngFor="let reply of ticket.replies">
            <strong>{{ reply.createdBy }}</strong>
            <p>{{ reply.replyText }}</p>
            <small>{{ reply.replyDateUtc | date:'medium' }}</small>
          </div>
          <p *ngIf="ticket.replies.length === 0">No replies on this ticket yet.</p>
        </section>

        <section>
          <h3>Status timeline</h3>
          <div class="history-card" *ngFor="let history of ticket.statusHistory">
            <strong>{{ history.status }}</strong>
            <p>{{ history.remarks }}</p>
            <small>{{ history.statusDateUtc | date:'medium' }}</small>
          </div>
        </section>
      </div>

      <section class="section-card">
        <h3>Reply to ticket</h3>
        <form class="reply-form" [formGroup]="replyForm" (ngSubmit)="addReply()">
          <label>
            Reply
            <textarea rows="4" formControlName="replyText" placeholder="Share the latest update, additional details, or clarify the issue."></textarea>
          </label>
          <div class="action-row">
            <button type="submit" [disabled]="replyForm.invalid || isSubmittingReply">{{ isSubmittingReply ? 'Sending...' : 'Post Reply' }}</button>
            <button type="button" class="secondary" (click)="closeTicket()" [disabled]="!ticket.canCustomerClose">Close Ticket</button>
            <button type="button" class="secondary" (click)="reopenTicket()">Reopen Ticket</button>
          </div>
        </form>
      </section>

      <p class="message" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #loadingState>
      <section class="page">
        <p>{{ errorMessage || 'Loading support ticket...' }}</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .back-link { color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #eafaf7 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .pill { padding: 14px 18px; border-radius: 999px; background: white; border: 1px solid var(--coolzo-border); font-weight: 700; }
    .grid, .detail-grid { display: grid; gap: 16px; }
    .grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .detail-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    article, section { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    .line-card, .history-card { padding: 14px; border-radius: 16px; background: #f9fffe; border: 1px solid var(--coolzo-border); margin-top: 12px; }
    .reply-form { display: grid; gap: 12px; }
    label { display: grid; gap: 8px; font-weight: 700; }
    textarea { border: 1px solid var(--coolzo-border); border-radius: 14px; padding: 11px 12px; font: inherit; }
    .action-row { display: flex; gap: 12px; flex-wrap: wrap; }
    button { border: 0; border-radius: 999px; padding: 12px 18px; background: var(--coolzo-primary); color: white; font-weight: 700; cursor: pointer; }
    .secondary { background: white; color: var(--coolzo-primary-dark); border: 1px solid var(--coolzo-border); }
    p, small, h2, h3, strong { margin: 0; }
    .message { color: #166534; }
    .error { color: #be123c; }
  `]
})
export class SupportTicketDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly supportApiService = inject(SupportApiService);

  ticket: SupportTicketDetailResponse | null = null;
  errorMessage = '';
  message = '';
  isSubmittingReply = false;

  readonly replyForm = this.formBuilder.group({
    replyText: ['', [Validators.required, Validators.maxLength(1024)]]
  });

  async ngOnInit(): Promise<void> {
    await this.loadTicket();
  }

  async loadTicket(): Promise<void> {
    const supportTicketId = Number(this.route.snapshot.paramMap.get('supportTicketId'));

    if (!supportTicketId) {
      this.errorMessage = 'Invalid support ticket identifier.';
      return;
    }

    try {
      this.ticket = await this.supportApiService.getTicketDetail(supportTicketId);
    } catch {
      this.errorMessage = 'Unable to load the support ticket.';
    }
  }

  async addReply(): Promise<void> {
    if (!this.ticket || this.replyForm.invalid) {
      return;
    }

    this.errorMessage = '';
    this.message = '';
    this.isSubmittingReply = true;

    try {
      await this.supportApiService.addReply(this.ticket.supportTicketId, this.replyForm.getRawValue().replyText ?? '');
      this.replyForm.reset({ replyText: '' });
      await this.loadTicket();
      this.message = 'Reply posted successfully.';
    } catch {
      this.errorMessage = 'Unable to post the reply right now.';
    } finally {
      this.isSubmittingReply = false;
    }
  }

  async closeTicket(): Promise<void> {
    if (!this.ticket) {
      return;
    }

    try {
      this.ticket = await this.supportApiService.closeTicket(this.ticket.supportTicketId, 'Customer closed the ticket from the portal.');
      this.message = 'Support ticket closed successfully.';
    } catch {
      this.errorMessage = 'Unable to close the support ticket right now.';
    }
  }

  async reopenTicket(): Promise<void> {
    if (!this.ticket) {
      return;
    }

    try {
      this.ticket = await this.supportApiService.reopenTicket(this.ticket.supportTicketId, 'Customer reopened the ticket from the portal.');
      this.message = 'Support ticket reopened successfully.';
    } catch {
      this.errorMessage = 'Unable to reopen the support ticket right now.';
    }
  }
}
