import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from './content-api.service';
import { CMSFaqResponse } from './content.models';

interface FaqGroup {
  category: string;
  items: CMSFaqResponse[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <div class="hero">
        <div>
          <p class="eyebrow">Help Center</p>
          <h1>Customer FAQs</h1>
          <p>Browse the published CMS FAQ library before booking, paying, or following up on service work.</p>
        </div>
        <div class="actions">
          <a routerLink="/home">Home</a>
          <a routerLink="/booking" class="secondary">Book a Service</a>
        </div>
      </div>

      <div class="faq-groups" *ngIf="faqGroups.length > 0; else emptyState">
        <section class="group" *ngFor="let group of faqGroups">
          <div class="group-header">
            <h2>{{ group.category }}</h2>
            <small>{{ group.items.length }} questions</small>
          </div>
          <article class="faq-card" *ngFor="let faq of group.items">
            <h3>{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
          </article>
        </section>
      </div>

      <ng-template #emptyState>
        <section class="empty">
          <h2 *ngIf="!errorMessage">No FAQ content published</h2>
          <h2 *ngIf="errorMessage">FAQ content unavailable</h2>
          <p>{{ errorMessage || 'Publish FAQ content from the admin CMS workspace to make it visible here.' }}</p>
        </section>
      </ng-template>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 24px; max-width: 960px; margin: 0 auto; padding: 24px; }
    .hero, .group, .empty { padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: white; }
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 20px; background: linear-gradient(135deg, #effbf9 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    h1, h2, h3, p, small { margin: 0; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .actions a { display: inline-flex; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 700; background: var(--coolzo-primary); color: white; }
    .actions .secondary { background: white; color: var(--coolzo-primary-dark); border: 1px solid var(--coolzo-border); }
    .faq-groups { display: grid; gap: 18px; }
    .group { display: grid; gap: 16px; }
    .group-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .faq-card { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: #f7fcfb; display: grid; gap: 10px; }
    .empty { text-align: center; }
    @media (max-width: 768px) {
      .hero, .group-header { align-items: flex-start; flex-direction: column; }
    }
  `]
})
export class FaqComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  faqs: CMSFaqResponse[] = [];
  errorMessage = '';

  get faqGroups(): FaqGroup[] {
    const grouped = new Map<string, CMSFaqResponse[]>();

    this.faqs.forEach((faq) => {
      const category = faq.category || 'General';
      const items = grouped.get(category) ?? [];
      items.push(faq);
      grouped.set(category, items);
    });

    return Array.from(grouped.entries()).map(([category, items]) => ({ category, items }));
  }

  async ngOnInit(): Promise<void> {
    try {
      this.faqs = await this.contentApiService.getPublicFaqs();
    } catch {
      this.errorMessage = 'Unable to load the published FAQ content right now.';
    }
  }
}
