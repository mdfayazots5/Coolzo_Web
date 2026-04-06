import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="shell" [class.nav-open]="isNavOpen">
      <header class="header">
        <div class="brand">
          <p class="eyebrow">Coolzo</p>
          <h1>Customer Booking Portal</h1>
          <p>Track bookings, quotation approvals, invoice status, preferences, and support follow-up from one customer portal.</p>
        </div>
        <div class="actions">
          <span class="user-chip">{{ authService.getFullName() }}</span>
          <button
            type="button"
            class="nav-toggle"
            aria-controls="customer-shell-nav"
            [attr.aria-expanded]="isNavOpen"
            (click)="toggleNav()">
            {{ isNavOpen ? 'Close Menu' : 'Menu' }}
          </button>
          <button type="button" class="logout" (click)="logout()">Logout</button>
        </div>
      </header>

      <button
        *ngIf="isNavOpen"
        type="button"
        class="backdrop"
        aria-label="Close navigation"
        (click)="closeNav()"></button>

      <nav id="customer-shell-nav" class="nav" [class.nav-visible]="isNavOpen">
        <a
          *ngFor="let link of navLinks"
          [routerLink]="link.path"
          (click)="closeNav()">
          {{ link.label }}
        </a>
      </nav>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { position: relative; padding: clamp(16px, 3vw, 24px); max-width: 1120px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 18px; }
    .brand { display: grid; gap: 8px; min-width: 0; }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    h1 { margin: 0 0 8px; }
    .actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex-wrap: wrap; }
    .user-chip {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 14px;
      border-radius: 999px;
      background: rgba(15, 118, 110, 0.08);
      color: var(--coolzo-primary-dark);
      font-weight: 700;
    }
    .actions button {
      min-height: 44px;
      border-radius: 999px;
      padding: 10px 16px;
      cursor: pointer;
      font-weight: 700;
    }
    .nav-toggle {
      display: none;
      border: 1px solid var(--coolzo-border);
      background: white;
      color: var(--coolzo-primary-dark);
    }
    .logout {
      border: 0;
      background: var(--coolzo-primary);
      color: white;
    }
    .nav { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 0 18px; }
    .content {
      background: white;
      border: 1px solid var(--coolzo-border);
      border-radius: clamp(20px, 3vw, 24px);
      padding: clamp(18px, 3vw, 24px);
      box-shadow: 0 18px 40px rgba(15, 118, 110, 0.08);
    }
    .nav a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--coolzo-primary-dark);
      text-decoration: none;
      font-weight: 700;
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid var(--coolzo-border);
      background: rgba(255, 255, 255, 0.88);
    }
    .backdrop { display: none; }

    @media (max-width: 900px) {
      .header { flex-direction: column; }
      .actions { width: 100%; justify-content: flex-start; }
    }

    @media (max-width: 768px) {
      .actions {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        width: 100%;
      }
      .user-chip {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .nav-toggle { display: inline-flex; align-items: center; justify-content: center; }
      .nav {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 30;
        display: none;
        flex-direction: column;
        flex-wrap: nowrap;
        width: min(84vw, 320px);
        height: 100dvh;
        margin: 0;
        padding: 92px 16px 24px;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.98);
        box-shadow: -18px 0 40px rgba(15, 23, 42, 0.18);
        backdrop-filter: blur(18px);
      }
      .nav.nav-visible { display: flex; }
      .nav a { width: 100%; justify-content: flex-start; }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 20;
        display: block;
        border: 0;
        background: rgba(15, 23, 42, 0.32);
      }
    }

    @media (max-width: 560px) {
      .actions {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .user-chip {
        grid-column: 1 / -1;
        justify-content: center;
      }
      .nav-toggle,
      .logout {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AppShellComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly navLinks: readonly NavLink[] = [
    { label: 'Home', path: '/home' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Book a Service', path: '/booking' },
    { label: 'Request Callback', path: '/inquiry' },
    { label: 'My Installations', path: '/my-installations' },
    { label: 'FAQs', path: '/faq' },
    { label: 'My Bookings', path: '/my-bookings' },
    { label: 'My Invoices', path: '/my-invoices' },
    { label: 'Preferences', path: '/communication-preferences' },
    { label: 'Support Tickets', path: '/support-tickets' },
    { label: 'AMC', path: '/amc' },
    { label: 'Service History', path: '/service-history' }
  ];
  isNavOpen = false;

  toggleNav(): void {
    this.isNavOpen = !this.isNavOpen;
  }

  closeNav(): void {
    this.isNavOpen = false;
  }

  logout(): void {
    this.closeNav();
    this.authService.logout();
    void this.router.navigate(['/home']);
  }
}
