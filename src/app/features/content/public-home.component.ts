import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ContentApiService } from './content-api.service';
import {
  CMSBannerResponse,
  CMSBlockResponse,
  CMSFaqResponse,
  PublicHomeCMSContentResponse
} from './content.models';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page" *ngIf="content as vm; else loadingState">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Coolzo Home</p>
          <h1>{{ heroBlock?.title || 'AC service booking, follow-up, and support in one place' }}</h1>
          <p>{{ heroBlock?.summary || 'Use the CMS-driven home experience to discover services, contact info, and live customer actions without waiting for a deploy.' }}</p>
          <div class="hero-actions">
            <a routerLink="/booking">Book a Service</a>
            <a routerLink="/inquiry" class="secondary">Request a Callback</a>
            <a routerLink="/installation-request" class="secondary">Request Installation</a>
            <a routerLink="/faq" class="secondary">Read FAQs</a>
            <a [routerLink]="authService.isAuthenticated() ? '/dashboard' : '/login'" class="secondary">
              {{ authService.isAuthenticated() ? 'Open Dashboard' : 'Customer Login' }}
            </a>
          </div>
        </div>
        <div class="hero-card">
          <h2>Contact Snapshot</h2>
          <p>{{ getDisplaySetting('footer', 'contactPhone') || 'Contact number will appear here once published.' }}</p>
          <p>{{ getDisplaySetting('footer', 'contactEmail') || 'Contact email will appear here once published.' }}</p>
          <small>{{ vm.banners.length }} active banners • {{ vm.blocks.length }} published content blocks</small>
        </div>
      </section>

      <section class="banner-grid" *ngIf="vm.banners.length > 0">
        <article class="banner-card" *ngFor="let banner of vm.banners">
          <div>
            <strong>{{ banner.bannerTitle }}</strong>
            <p>{{ banner.bannerSubtitle }}</p>
            <small>{{ banner.displayArea }}</small>
          </div>
          <a *ngIf="banner.redirectUrl" [href]="banner.redirectUrl" target="_blank" rel="noreferrer">Open</a>
        </article>
      </section>

      <section class="content-grid" *ngIf="homeBlocks.length > 0">
        <article class="content-card" *ngFor="let block of homeBlocks">
          <div>
            <small>{{ block.blockKey }}</small>
            <h2>{{ block.title }}</h2>
            <p>{{ block.summary || block.content }}</p>
          </div>
          <a routerLink="/booking">Start Booking</a>
        </article>
      </section>

      <section class="service-panel" *ngIf="serviceBlocks.length > 0">
        <div class="section-header">
          <div>
            <p class="eyebrow">Service Content</p>
            <h2>Published service guidance</h2>
          </div>
          <a routerLink="/faq" class="secondary-link">See all FAQs</a>
        </div>
        <div class="service-grid">
          <a class="service-card" *ngFor="let block of serviceBlocks" [routerLink]="['/services', block.blockKey]">
            <strong>{{ block.title }}</strong>
            <p>{{ block.summary || block.content }}</p>
            <small>Version {{ block.versionNumber }}</small>
          </a>
        </div>
      </section>

      <section class="faq-preview" *ngIf="faqPreview.length > 0">
        <div class="section-header">
          <div>
            <p class="eyebrow">FAQs</p>
            <h2>Quick answers before you book</h2>
          </div>
          <a routerLink="/faq" class="secondary-link">View all</a>
        </div>
        <div class="faq-grid">
          <article *ngFor="let faq of faqPreview">
            <small>{{ faq.category }}</small>
            <h3>{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
          </article>
        </div>
      </section>
    </section>

    <ng-template #loadingState>
      <section class="empty">
        <h2 *ngIf="!errorMessage">Loading public content...</h2>
        <h2 *ngIf="errorMessage">Public content unavailable</h2>
        <p>{{ errorMessage || 'The CMS-powered home screen is loading.' }}</p>
      </section>
    </ng-template>
  `,
  styles: [`
    .page { display: grid; gap: 24px; max-width: 1120px; margin: 0 auto; padding: 24px; }
    .hero { display: grid; grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr); gap: 20px; padding: 28px; border-radius: 28px; border: 1px solid var(--coolzo-border); background: linear-gradient(135deg, #d9f6f0 0%, #ffffff 58%, #eef9f7 100%); }
    .hero-copy { display: grid; gap: 14px; }
    .hero-card, .banner-card, .content-card, .service-panel, .faq-preview { border-radius: 24px; border: 1px solid var(--coolzo-border); background: white; }
    .hero-card { padding: 22px; display: grid; gap: 10px; align-content: start; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .hero-actions a, .content-card a { display: inline-flex; align-items: center; justify-content: center; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 700; background: var(--coolzo-primary); color: white; }
    .secondary { background: white !important; color: var(--coolzo-primary-dark) !important; border: 1px solid var(--coolzo-border); }
    .eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    h1, h2, h3, p, small { margin: 0; }
    .banner-grid, .content-grid, .service-grid, .faq-grid { display: grid; gap: 16px; }
    .banner-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .banner-card { padding: 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .banner-card a, .secondary-link { color: var(--coolzo-primary-dark); font-weight: 700; text-decoration: none; }
    .content-grid, .service-grid, .faq-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .content-card, .faq-grid article { padding: 22px; display: grid; gap: 10px; }
    .service-panel, .faq-preview { padding: 24px; display: grid; gap: 18px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .service-card { padding: 20px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: #f7fcfb; color: inherit; text-decoration: none; display: grid; gap: 8px; }
    .empty { max-width: 760px; margin: 80px auto; padding: 32px; border-radius: 24px; border: 1px dashed var(--coolzo-border); background: white; text-align: center; }
    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; }
      .section-header { align-items: flex-start; flex-direction: column; }
    }
  `]
})
export class PublicHomeComponent implements OnInit {
  private readonly contentApiService = inject(ContentApiService);

  readonly authService = inject(AuthService);

  content: PublicHomeCMSContentResponse | null = null;
  errorMessage = '';

  get heroBlock(): CMSBlockResponse | null {
    return this.content?.blocks.find((block) => block.blockKey === 'home.hero') ?? this.homeBlocks[0] ?? null;
  }

  get homeBlocks(): CMSBlockResponse[] {
    return (this.content?.blocks ?? []).filter((block) => block.blockKey.startsWith('home.'));
  }

  get serviceBlocks(): CMSBlockResponse[] {
    return (this.content?.blocks ?? []).filter((block) => block.blockKey.startsWith('service-content.'));
  }

  get faqPreview(): CMSFaqResponse[] {
    return (this.content?.faqs ?? []).slice(0, 3);
  }

  async ngOnInit(): Promise<void> {
    try {
      this.content = await this.contentApiService.getPublicHome();
    } catch {
      this.errorMessage = 'Unable to load the published CMS home content right now.';
    }
  }

  getDisplaySetting(contentGroup: string, contentKey: string): string | null {
    return this.content?.displaySettings.find(
      (setting) => setting.contentGroup === contentGroup && setting.contentKey === contentKey
    )?.contentValue ?? null;
  }
}
