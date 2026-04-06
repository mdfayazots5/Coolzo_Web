import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupportApiService } from './support-api.service';
import { SupportTicketListItemResponse } from './support.models';

@Component({
  selector: 'app-my-support-tickets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <h2>My Support Tickets</h2>
          <p>Track issue resolution, follow the support timeline, and continue the thread when the team needs more information.</p>
        </div>
        <a routerLink="/support-tickets/new">Create Support Ticket</a>
      </div>

      <div class="list" *ngIf="tickets.length > 0; else emptyState">
        <a class="card" *ngFor="let ticket of tickets" [routerLink]="['/support-tickets', ticket.supportTicketId]">
          <div>
            <strong>{{ ticket.ticketNumber }}</strong>
            <p>{{ ticket.subject }}</p>
            <small>{{ ticket.categoryName }} • {{ ticket.priorityName }}</small>
            <small>{{ ticket.linkedEntitySummary }}</small>
          </div>
          <div>
            <span>{{ ticket.status }}</span>
            <small>{{ ticket.assignedOwnerName || 'Support queue' }}</small>
            <small>{{ (ticket.lastUpdated || ticket.dateCreated) | date:'mediumDate' }}</small>
          </div>
        </a>
      </div>

      <ng-template #emptyState>
        <div class="empty">
          <h3>No support tickets yet</h3>
          <p>Create a ticket whenever you need help on a booking, invoice, AMC plan, warranty case, or revisit issue.</p>
        </div>
      </ng-template>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 18px; }
    .header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .header a { padding: 12px 18px; border-radius: 999px; text-decoration: none; color: white; background: var(--coolzo-primary); font-weight: 700; }
    .list { display: grid; gap: 14px; }
    .card { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: #f9fffe; color: inherit; text-decoration: none; }
    strong { font-size: 18px; }
    p, small { margin: 6px 0 0; color: #49706b; }
    span { display: inline-flex; padding: 6px 10px; border-radius: 999px; background: rgba(15, 118, 110, 0.12); color: var(--coolzo-primary-dark); font-weight: 700; }
    .empty { padding: 24px; border-radius: 20px; border: 1px dashed var(--coolzo-border); text-align: center; }
    .error { color: #be123c; }
  `]
})
export class MySupportTicketsComponent implements OnInit {
  private readonly supportApiService = inject(SupportApiService);

  tickets: SupportTicketListItemResponse[] = [];
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    try {
      const response = await this.supportApiService.getMyTickets();
      this.tickets = response.items;
    } catch {
      this.errorMessage = 'Unable to load support tickets right now.';
    }
  }
}
