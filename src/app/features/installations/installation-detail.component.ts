import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InstallationApiService } from './installation-api.service';
import { InstallationDetailResponse, InstallationProposalResponse } from './installation.models';

@Component({
  selector: 'app-installation-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page" *ngIf="installation as vm">
      <div class="header">
        <div>
          <p class="eyebrow">Installation Tracker</p>
          <h2>{{ vm.installationNumber }}</h2>
          <p>{{ vm.installationType }} • {{ vm.numberOfUnits }} unit(s) • {{ vm.installationStatus }}</p>
        </div>
        <a routerLink="/my-installations">Back To List</a>
      </div>

      <section class="grid">
        <article class="card">
          <h3>Site summary</h3>
          <p>{{ vm.addressLine1 }}{{ vm.addressLine2 ? ', ' + vm.addressLine2 : '' }}, {{ vm.cityName }} {{ vm.pincode }}</p>
          <small>Technician: {{ vm.assignedTechnicianName || 'Pending assignment' }}</small>
          <small>Survey: {{ vm.surveyDateUtc ? (vm.surveyDateUtc | date:'medium') : 'Not scheduled yet' }}</small>
          <small>Installation date: {{ vm.scheduledInstallationDateUtc ? (vm.scheduledInstallationDateUtc | date:'medium') : 'Pending scheduling' }}</small>
          <small *ngIf="vm.siteNotes">Notes: {{ vm.siteNotes }}</small>
        </article>

        <article class="card">
          <h3>Customer actions</h3>
          <p>Approval: <strong>{{ vm.approvalStatus }}</strong></p>
          <p>Commissioned: <strong>{{ vm.commissionedDateUtc ? 'Yes' : 'Pending' }}</strong></p>
          <small *ngIf="latestCertificate">Warranty: {{ latestCertificate.warrantyRegistrationNumber }}</small>
          <small *ngIf="latestCertificate">Commissioned on {{ latestCertificate.commissioningDateUtc | date:'medium' }}</small>
        </article>
      </section>

      <section class="card" *ngIf="pendingProposal as proposal; else proposalHistory">
        <h3>Proposal approval</h3>
        <div class="proposal-header">
          <div>
            <strong>{{ proposal.proposalNumber }}</strong>
            <p>{{ proposal.totalAmount | currency:'INR':'symbol':'1.0-0' }} • {{ proposal.proposalStatus }}</p>
          </div>
          <small>{{ proposal.generatedDateUtc | date:'medium' }}</small>
        </div>

        <div class="line-grid">
          <article class="line-card" *ngFor="let line of proposal.lines">
            <strong>{{ line.lineDescription }}</strong>
            <p>{{ line.quantity }} × {{ line.unitPrice | currency:'INR':'symbol':'1.0-0' }}</p>
            <small>{{ line.remarks || 'No line remarks.' }}</small>
          </article>
        </div>

        <p *ngIf="proposal.proposalRemarks">{{ proposal.proposalRemarks }}</p>

        <form class="decision-form" [formGroup]="decisionForm">
          <label>
            Remarks
            <textarea rows="4" formControlName="customerRemarks" placeholder="Share questions or confirmation remarks"></textarea>
          </label>
          <div class="action-row">
            <button type="button" (click)="approveProposal()">Approve Proposal</button>
            <button type="button" class="danger" (click)="rejectProposal()">Reject Proposal</button>
          </div>
        </form>
      </section>

      <ng-template #proposalHistory>
        <section class="card" *ngIf="vm.proposals.length">
          <h3>Proposal history</h3>
          <article class="nested-card" *ngFor="let proposal of vm.proposals">
            <div class="proposal-header">
              <div>
                <strong>{{ proposal.proposalNumber }}</strong>
                <p>{{ proposal.proposalStatus }}</p>
              </div>
              <small>{{ proposal.generatedDateUtc | date:'medium' }}</small>
            </div>
            <small>Total {{ proposal.totalAmount | currency:'INR':'symbol':'1.0-0' }}</small>
            <small *ngIf="proposal.customerRemarks">Remarks: {{ proposal.customerRemarks }}</small>
          </article>
        </section>
      </ng-template>

      <section class="grid">
        <article class="card">
          <h3>Checklist snapshot</h3>
          <div class="timeline-item" *ngFor="let checklist of vm.checklistItems">
            <strong>{{ checklist.checklistTitle }}</strong>
            <small>{{ checklist.isCompleted ? 'Completed' : 'Pending' }} • {{ checklist.isMandatory ? 'Mandatory' : 'Optional' }}</small>
            <small *ngIf="checklist.responseRemarks">{{ checklist.responseRemarks }}</small>
          </div>
          <small *ngIf="!vm.checklistItems.length">Checklist will appear once the field team begins execution.</small>
        </article>

        <article class="card">
          <h3>Status timeline</h3>
          <div class="timeline-item" *ngFor="let item of vm.statusTimeline">
            <strong>{{ item.currentStatus }}</strong>
            <small>{{ item.changedDateUtc | date:'medium' }} • {{ item.changedByRole }}</small>
            <small>{{ item.remarks }}</small>
          </div>
        </article>
      </section>

      <section class="card" *ngIf="vm.orders.length">
        <h3>Execution order</h3>
        <article class="nested-card" *ngFor="let order of vm.orders">
          <strong>{{ order.installationOrderNumber }}</strong>
          <small>{{ order.currentStatus }} • Tech: {{ order.technicianName || 'Pending assignment' }}</small>
          <small *ngIf="order.scheduledInstallationDateUtc">Scheduled {{ order.scheduledInstallationDateUtc | date:'medium' }}</small>
          <small *ngIf="order.executionStartedDateUtc">Started {{ order.executionStartedDateUtc | date:'medium' }}</small>
          <small *ngIf="order.executionCompletedDateUtc">Completed {{ order.executionCompletedDateUtc | date:'medium' }}</small>
        </article>
      </section>

      <section class="card" *ngIf="vm.commissioningCertificates.length">
        <h3>Commissioning confirmation</h3>
        <article class="nested-card" *ngFor="let certificate of vm.commissioningCertificates">
          <strong>{{ certificate.certificateNumber }}</strong>
          <small>{{ certificate.customerConfirmationName }} • {{ certificate.commissioningDateUtc | date:'medium' }}</small>
          <small>Warranty: {{ certificate.warrantyRegistrationNumber }}</small>
          <small>{{ certificate.remarks || 'No commissioning remarks shared.' }}</small>
        </article>
      </section>

      <p class="message" *ngIf="message">{{ message }}</p>
      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 18px; }
    .header { display: flex; justify-content: space-between; align-items: start; gap: 16px; }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .header a, button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 18px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      background: var(--coolzo-primary);
      color: white;
      border: 0;
      cursor: pointer;
    }
    .danger { background: #b91c1c; }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .card, .nested-card, .line-card { border-radius: 20px; border: 1px solid var(--coolzo-border); background: white; }
    .card { padding: 20px; display: grid; gap: 12px; }
    .nested-card, .line-card { padding: 14px; display: grid; gap: 6px; background: #f7fcfb; }
    .proposal-header { display: flex; justify-content: space-between; gap: 16px; align-items: start; }
    .line-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .decision-form { display: grid; gap: 12px; }
    label { display: grid; gap: 8px; font-weight: 700; }
    textarea {
      width: 100%;
      border: 1px solid var(--coolzo-border);
      border-radius: 16px;
      padding: 12px 14px;
      background: #f7fcfb;
      font: inherit;
      resize: vertical;
      min-height: 110px;
    }
    .action-row { display: flex; flex-wrap: wrap; gap: 10px; }
    .timeline-item { display: grid; gap: 4px; padding-bottom: 10px; border-bottom: 1px solid var(--coolzo-border); }
    .timeline-item:last-child { border-bottom: 0; padding-bottom: 0; }
    .message { color: #166534; margin: 0; }
    .error { color: #b91c1c; margin: 0; }
    @media (max-width: 768px) {
      .header, .proposal-header { flex-direction: column; }
    }
  `]
})
export class InstallationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly installationApiService = inject(InstallationApiService);

  installation: InstallationDetailResponse | null = null;
  message = '';
  errorMessage = '';

  readonly decisionForm = this.formBuilder.group({
    customerRemarks: ['']
  });

  get pendingProposal(): InstallationProposalResponse | null {
    return this.installation?.proposals.find((proposal) => proposal.proposalStatus === 'PendingApproval') ?? null;
  }

  get latestCertificate() {
    return this.installation?.commissioningCertificates[0] ?? null;
  }

  async ngOnInit(): Promise<void> {
    await this.loadInstallation();
  }

  async loadInstallation(): Promise<void> {
    const installationId = Number(this.route.snapshot.paramMap.get('installationId'));

    if (!installationId) {
      this.errorMessage = 'Installation id is invalid.';
      return;
    }

    this.errorMessage = '';

    try {
      this.installation = await this.installationApiService.getInstallationDetail(installationId);
    } catch {
      this.errorMessage = 'Unable to load installation detail right now.';
    }
  }

  async approveProposal(): Promise<void> {
    if (!this.installation) {
      return;
    }

    try {
      await this.installationApiService.approveProposal(this.installation.installationId, this.decisionForm.value.customerRemarks ?? '');
      this.message = 'Proposal approved successfully.';
      this.errorMessage = '';
      await this.loadInstallation();
    } catch {
      this.errorMessage = 'Unable to approve the proposal right now.';
    }
  }

  async rejectProposal(): Promise<void> {
    if (!this.installation) {
      return;
    }

    try {
      await this.installationApiService.rejectProposal(this.installation.installationId, this.decisionForm.value.customerRemarks ?? '');
      this.message = 'Proposal rejected successfully.';
      this.errorMessage = '';
      await this.loadInstallation();
    } catch {
      this.errorMessage = 'Unable to reject the proposal right now.';
    }
  }
}
