import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LifecycleApiService } from './lifecycle-api.service';
import { AmcPlanResponse, CustomerAmcResponse } from './lifecycle.models';

@Component({
  selector: 'app-amc-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <div class="hero">
        <div>
          <p class="eyebrow">AMC Lifecycle</p>
          <h2>Annual maintenance at a glance</h2>
          <p>Review the active AMC plans available in Coolzo and track every subscription already linked to your completed service history.</p>
        </div>
        <div class="hero-stats">
          <div class="stat-card">
            <strong>{{ subscriptions.length }}</strong>
            <span>Active subscriptions</span>
          </div>
          <div class="stat-card">
            <strong>{{ remainingVisits }}</strong>
            <span>Remaining visits</span>
          </div>
          <a routerLink="/service-history" class="hero-link">Open Service History</a>
        </div>
      </div>

      <section class="section-card">
        <div class="section-heading">
          <div>
            <h3>My AMC Coverage</h3>
            <p>Every subscription is tied back to the originating invoice and job card from the completed service flow.</p>
          </div>
        </div>

        <div class="subscription-grid" *ngIf="subscriptions.length > 0; else emptySubscriptions">
          <article *ngFor="let subscription of subscriptions">
            <div class="subscription-head">
              <div>
                <strong>{{ subscription.planName }}</strong>
                <p>{{ subscription.currentStatus }}</p>
              </div>
              <span>{{ subscription.consumedVisitCount }}/{{ subscription.totalVisitCount }} visits used</span>
            </div>
            <small>Coverage: {{ subscription.startDateUtc | date:'mediumDate' }} to {{ subscription.endDateUtc | date:'mediumDate' }}</small>
            <small>Invoice: {{ subscription.invoiceNumber }}</small>
            <small>Job card: {{ subscription.jobCardNumber }}</small>
            <small>Plan value: {{ currency(subscription.priceAmount) }}</small>
            <a
              [routerLink]="['/support-tickets/new']"
              [queryParams]="{
                linkedEntityType: 'CustomerAMC',
                linkedEntityId: subscription.customerAmcId,
                subject: 'Support needed for AMC ' + subscription.planName,
                linkLabel: subscription.planName
              }"
              class="support-link">
              Raise Support Ticket
            </a>

            <div class="visit-list" *ngIf="subscription.visits.length > 0">
              <div class="visit-card" *ngFor="let visit of subscription.visits">
                <div>
                  <strong>Visit {{ visit.visitNumber }}</strong>
                  <p>{{ visit.currentStatus }}</p>
                </div>
                <small>{{ visit.scheduledDate | date:'mediumDate' }}</small>
                <small *ngIf="visit.serviceRequestNumber">Service request: {{ visit.serviceRequestNumber }}</small>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="section-card">
        <div class="section-heading">
          <div>
            <h3>Available AMC Plans</h3>
            <p>These plans are available for assignment once a completed service is invoiced and the support team links the coverage.</p>
          </div>
        </div>

        <div class="plan-grid" *ngIf="plans.length > 0; else loadingPlans">
          <article *ngFor="let plan of plans">
            <div class="subscription-head">
              <div>
                <strong>{{ plan.planName }}</strong>
                <p>{{ plan.visitCount }} scheduled visits</p>
              </div>
              <span>{{ currency(plan.priceAmount) }}</span>
            </div>
            <small>{{ plan.durationInMonths }} months of coverage</small>
            <p>{{ plan.planDescription || 'Support team can link this AMC plan after the invoice is closed.' }}</p>
            <small>{{ plan.termsAndConditions || 'Terms will be shared during AMC assignment.' }}</small>
          </article>
        </div>
      </section>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>

    <ng-template #emptySubscriptions>
      <div class="empty-state">
        <h3>No AMC subscriptions linked yet</h3>
        <p>Your AMC subscriptions will appear here after the support team assigns a plan against a completed job and invoice.</p>
      </div>
    </ng-template>

    <ng-template #loadingPlans>
      <p>{{ errorMessage || 'Loading AMC plans...' }}</p>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 20px; }
    .hero { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #eefcf9 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .hero-stats { display: grid; gap: 12px; align-content: start; }
    .stat-card, .hero-link { padding: 16px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    .hero-link { text-decoration: none; color: var(--coolzo-primary-dark); font-weight: 700; text-align: center; }
    .section-card { padding: 20px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: white; display: grid; gap: 16px; }
    .section-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .plan-grid, .subscription-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    article { padding: 18px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: #f9fffe; display: grid; gap: 8px; }
    .subscription-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
    .subscription-head span { padding: 8px 12px; border-radius: 999px; background: rgba(15, 118, 110, 0.12); color: var(--coolzo-primary-dark); font-weight: 700; }
    .visit-list { display: grid; gap: 10px; margin-top: 8px; }
    .visit-card { padding: 12px; border-radius: 16px; border: 1px solid var(--coolzo-border); background: white; display: grid; gap: 4px; }
    .support-link { width: fit-content; color: var(--coolzo-primary-dark); text-decoration: none; font-weight: 700; }
    h2, h3, p, small, strong { margin: 0; }
    .empty-state { padding: 24px; border-radius: 20px; border: 1px dashed var(--coolzo-border); text-align: center; }
    .error { color: #be123c; }
  `]
})
export class AmcOverviewComponent implements OnInit {
  private readonly lifecycleApiService = inject(LifecycleApiService);

  plans: AmcPlanResponse[] = [];
  subscriptions: CustomerAmcResponse[] = [];
  errorMessage = '';

  get remainingVisits(): number {
    return this.subscriptions.reduce((total, subscription) => total + Math.max(subscription.totalVisitCount - subscription.consumedVisitCount, 0), 0);
  }

  async ngOnInit(): Promise<void> {
    try {
      const [plans, subscriptions] = await Promise.all([
        this.lifecycleApiService.getPlans(),
        this.lifecycleApiService.getMyAmc()
      ]);

      this.plans = plans.items;
      this.subscriptions = subscriptions;
    } catch {
      this.errorMessage = 'Unable to load AMC information right now.';
    }
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }
}
