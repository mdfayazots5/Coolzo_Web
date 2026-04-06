import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { InvoiceDetailComponent } from './features/billing/invoice-detail.component';
import { InvoiceListComponent } from './features/billing/invoice-list.component';
import { QuotationDetailComponent } from './features/billing/quotation-detail.component';
import { BookingWizardComponent } from './features/booking/booking-wizard.component';
import { BookingDetailComponent } from './features/bookings/booking-detail.component';
import { MyBookingsComponent } from './features/bookings/my-bookings.component';
import { CancellationRequestComponent } from './features/cancellations/cancellation-request.component';
import { RefundStatusComponent } from './features/cancellations/refund-status.component';
import { CommunicationPreferencesComponent } from './features/content/communication-preferences.component';
import { FaqComponent } from './features/content/faq.component';
import { PublicHomeComponent } from './features/content/public-home.component';
import { ServiceContentComponent } from './features/content/service-content.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ForbiddenComponent } from './features/errors/forbidden.component';
import { InstallationDetailComponent } from './features/installations/installation-detail.component';
import { InstallationListComponent } from './features/installations/installation-list.component';
import { InstallationRequestComponent } from './features/installations/installation-request.component';
import { LeadCaptureComponent } from './features/lead/lead-capture.component';
import { AmcOverviewComponent } from './features/lifecycle/amc-overview.component';
import { RevisitRequestComponent } from './features/lifecycle/revisit-request.component';
import { ServiceHistoryComponent } from './features/lifecycle/service-history.component';
import { WarrantyStatusComponent } from './features/lifecycle/warranty-status.component';
import { MySupportTicketsComponent } from './features/support/my-support-tickets.component';
import { SupportTicketCreateComponent } from './features/support/support-ticket-create.component';
import { SupportTicketDetailComponent } from './features/support/support-ticket-detail.component';
import { UnauthorizedComponent } from './features/errors/unauthorized.component';
import { AppShellComponent } from './layout/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    component: PublicHomeComponent
  },
  {
    path: 'faq',
    component: FaqComponent
  },
  {
    path: 'services/:key',
    component: ServiceContentComponent
  },
  {
    path: 'booking',
    component: BookingWizardComponent
  },
  {
    path: 'inquiry',
    component: LeadCaptureComponent
  },
  {
    path: 'installation-request',
    component: InstallationRequestComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'my-bookings',
        component: MyBookingsComponent
      },
      {
        path: 'my-bookings/:bookingId',
        component: BookingDetailComponent
      },
      {
        path: 'my-installations',
        component: InstallationListComponent
      },
      {
        path: 'my-installations/:installationId',
        component: InstallationDetailComponent
      },
      {
        path: 'my-bookings/:bookingId/cancel',
        component: CancellationRequestComponent
      },
      {
        path: 'refunds/:refundRequestId',
        component: RefundStatusComponent
      },
      {
        path: 'quotations/job/:jobCardId',
        component: QuotationDetailComponent
      },
      {
        path: 'my-invoices',
        component: InvoiceListComponent
      },
      {
        path: 'my-invoices/:invoiceId',
        component: InvoiceDetailComponent
      },
      {
        path: 'amc',
        component: AmcOverviewComponent
      },
      {
        path: 'warranty/invoice/:invoiceId',
        component: WarrantyStatusComponent
      },
      {
        path: 'revisit/booking/:bookingId',
        component: RevisitRequestComponent
      },
      {
        path: 'service-history',
        component: ServiceHistoryComponent
      },
      {
        path: 'communication-preferences',
        component: CommunicationPreferencesComponent
      },
      {
        path: 'support-tickets',
        component: MySupportTicketsComponent
      },
      {
        path: 'support-tickets/new',
        component: SupportTicketCreateComponent
      },
      {
        path: 'support-tickets/:supportTicketId',
        component: SupportTicketDetailComponent
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
