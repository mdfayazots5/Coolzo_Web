import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentApiService } from './content-api.service';
import { CMSBlockResponse } from './content.models';

@Component({
  selector: 'app-service-content',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page" *ngIf="block; else loadingState">
      <div class="header">
        <div>
          <p class="eyebrow">Service Information</p>
          <h1>{{ block.title }}</h1>
          <p>{{ block.summary || 'Published service guidance maintained from the Phase 8 CMS workspace.' }}</p>
        </div>
        <div class="actions">
          <a routerLink="/home">Home</a>
          <a routerLink="/booking" class="secondary">Book a Service</a>
        </div>
      </div>

      <article class="content-card">
        <img *ngIf="block.previewImageUrl" [src]="block.previewImageUrl" [alt]="block.title" />
        <div class="content-copy">
          <small>{{ block.blockKey }} • Version {{ block.versionNumber }}</small>
          <p>{{ block.content }}</p>
        </div>
      </article>
    </section>

    <ng-template #loadingState>
      <section class="empty">
        <h2 *ngIf="!errorMessage">Loading service content...</h2>
        <h2 *ngIf="errorMessage">Service content unavailable</h2>
        <p>{{ errorMessage || 'The requested CMS service article is loading.' }}</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 24px; max-width: 960px; margin: 0 auto; padding: 24px; }
    .header, .content-card, .empty { padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: white; }
    .header { display: flex; justify-content: space-between; align-items: center; gap: 20px; background: linear-gradient(135deg, #effbf9 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .actions a { display: inline-flex; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 700; background: var(--coolzo-primary); color: white; }
    .actions .secondary { background: white; color: var(--coolzo-primary-dark); border: 1px solid var(--coolzo-border); }
    .content-card { display: grid; gap: 18px; }
    img { width: 100%; max-height: 320px; object-fit: cover; border-radius: 20px; background: #f7fcfb; }
    .content-copy { display: grid; gap: 12px; }
    h1, p, small { margin: 0; }
    .empty { text-align: center; }
    @media (max-width: 768px) {
      .header { align-items: flex-start; flex-direction: column; }
    }
  `]
})
export class ServiceContentComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly contentApiService = inject(ContentApiService);

  block: CMSBlockResponse | null = null;
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    const key = this.route.snapshot.paramMap.get('key')?.trim() ?? '';

    if (!key) {
      this.errorMessage = 'No service content key was provided.';
      return;
    }

    try {
      this.block = await this.contentApiService.getPublicServiceContent(key);
    } catch {
      this.errorMessage = 'Unable to load the requested service content.';
    }
  }
}
