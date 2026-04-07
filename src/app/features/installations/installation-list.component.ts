import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InstallationApiService } from './installation-api.service';
import { InstallationListItemResponse } from './installation.models';

@Component({
  selector: 'app-installation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <p class="eyebrow">Customer Installations</p>
          <h2>My installation requests</h2>
          <p>Track survey planning, proposal release, installation execution, and final commissioning from the customer portal.</p>
        </div>
        <a routerLink="/installation-request">New Request</a>
      </div>

      <div class="list" *ngIf="installations.length > 0; else emptyState">
        <a class="card" *ngFor="let installation of installations" [routerLink]="['/my-installations', installation.installationId]">
          <div class="primary">
            <strong>{{ installation.installationNumber }}</strong>
            <p>{{ installation.installationType }} • {{ installation.numberOfUnits }} unit(s)</p>
            <small>{{ installation.addressSummary }}</small>
          </div>
          <div class="secondary">
            <span>{{ installation.installationStatus }}</span>
            <small>Approval: {{ installation.approvalStatus }}</small>
            <small *ngIf="installation.proposalNumber">{{ installation.proposalNumber }} • {{ installation.proposalTotalAmount | currency:'INR':'symbol':'1.0-0' }}</small>
            <small *ngIf="installation.scheduledInstallationDateUtc">Visit: {{ installation.scheduledInstallationDateUtc | date:'medium' }}</small>
          </div>
        </a>
      </div>

      <ng-template #emptyState>
        <div class="empty">
          <h3>No installation requests yet</h3>
          <p>Use the installation request form to start the survey and proposal flow.</p>
          <a routerLink="/installation-request">Create Installation Request</a>
        </div>
      </ng-template>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 18px; }
    .header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .header a, .empty a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 18px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      background: var(--coolzo-primary);
      color: white;
    }
    .list { display: grid; gap: 14px; }
    .card {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      padding: 18px;
      border-radius: 20px;
      border: 1px solid var(--coolzo-border);
      background: white;
      color: inherit;
      text-decoration: none;
    }
    .primary p, .primary small, .secondary small { margin: 6px 0 0; color: var(--coolzo-primary-dark); opacity: 0.82; }
    .secondary { display: grid; justify-items: end; text-align: right; gap: 6px; }
    span {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(15, 118, 110, 0.12);
      color: var(--coolzo-primary-dark);
      font-weight: 700;
    }
    .empty {
      padding: 24px;
      border-radius: 20px;
      border: 1px dashed var(--coolzo-border);
      text-align: center;
      display: grid;
      gap: 12px;
      justify-items: center;
    }
    .error { color: #b91c1c; margin: 0; }
    @media (max-width: 768px) {
      .header, .card { flex-direction: column; align-items: flex-start; }
      .secondary { justify-items: start; text-align: left; }
    }
  `]
})
export class InstallationListComponent implements OnInit {
  private readonly installationApiService = inject(InstallationApiService);

  installations: InstallationListItemResponse[] = [];
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    try {
      const response = await this.installationApiService.listInstallations({
        pageNumber: 1,
        pageSize: 20
      });

      this.installations = response.items;
    } catch {
      this.errorMessage = 'Unable to load your installations right now.';
    }
  }
}
