import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BookingApiService } from './booking-api.service';
import {
  AcTypeLookupResponse,
  BookingSummaryResponse,
  BrandLookupResponse,
  ServiceCategoryLookupResponse,
  ServiceLookupResponse,
  SlotAvailabilityResponse,
  TonnageLookupResponse,
  ZoneLookupResponse
} from './booking.models';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="hero">
        <div>
          <p class="eyebrow">Phase 1 Booking Flow</p>
          <h1>Book AC service in one guided flow</h1>
          <p>Public visitors can complete a guest booking, while signed-in customers reuse the same wizard and keep the booking in their history.</p>
        </div>
        <div class="hero-actions">
          <a routerLink="/login" *ngIf="!authService.isAuthenticated()">Customer Login</a>
          <a routerLink="/my-bookings" *ngIf="authService.isAuthenticated()">Go to My Bookings</a>
        </div>
      </div>

      <div class="stepper">
        <button *ngFor="let step of steps; let index = index" type="button" [class.active]="index === currentStep">
          <span>{{ index + 1 }}</span>
          <strong>{{ step }}</strong>
        </button>
      </div>

      <section class="panel" *ngIf="currentStep === 0">
        <div class="panel-header">
          <div>
            <h2>Service Selection</h2>
            <p>Select a service category first, then choose the exact service.</p>
          </div>
          <p class="status" *ngIf="isLoadingLookups">Loading master data...</p>
        </div>

        <div class="choice-grid categories">
          <button
            type="button"
            *ngFor="let category of serviceCategories"
            [class.selected]="selectedCategoryId === category.serviceCategoryId"
            (click)="selectCategory(category)">
            <strong>{{ category.categoryName }}</strong>
            <span>{{ category.description }}</span>
          </button>
        </div>

        <div class="choice-grid services" *ngIf="services.length > 0">
          <button
            type="button"
            *ngFor="let service of services"
            [class.selected]="selectedService?.serviceId === service.serviceId"
            (click)="selectedService = service">
            <strong>{{ service.serviceName }}</strong>
            <span>{{ service.summary }}</span>
            <em>{{ currency(service.basePrice) }} • {{ service.pricingModelName }}</em>
          </button>
        </div>

        <div class="actions">
          <button type="button" class="primary" (click)="goToStep(1)" [disabled]="!selectedService">Continue</button>
        </div>
      </section>

      <section class="panel" *ngIf="currentStep === 1">
        <div class="panel-header">
          <div>
            <h2>Equipment Details</h2>
            <p>Capture the equipment basics before we look up the correct zone and available slots.</p>
          </div>
        </div>

        <form class="form-grid" [formGroup]="equipmentForm">
          <label>
            AC Type
            <select formControlName="acTypeId">
              <option value="">Select AC Type</option>
              <option *ngFor="let acType of acTypes" [value]="acType.acTypeId">{{ acType.acTypeName }}</option>
            </select>
          </label>
          <label>
            Tonnage
            <select formControlName="tonnageId">
              <option value="">Select Tonnage</option>
              <option *ngFor="let tonnage of tonnages" [value]="tonnage.tonnageId">{{ tonnage.tonnageName }}</option>
            </select>
          </label>
          <label>
            Brand
            <select formControlName="brandId">
              <option value="">Select Brand</option>
              <option *ngFor="let brand of brands" [value]="brand.brandId">{{ brand.brandName }}</option>
            </select>
          </label>
          <label>
            Model Name
            <input type="text" formControlName="modelName" placeholder="Optional model name" />
          </label>
          <label class="full">
            Issue Notes
            <textarea rows="4" formControlName="issueNotes" placeholder="Optional symptom or issue notes"></textarea>
          </label>
        </form>

        <div class="actions">
          <button type="button" class="secondary" (click)="goToStep(0)">Back</button>
          <button type="button" class="primary" (click)="goToStep(2)">Continue</button>
        </div>
      </section>

      <section class="panel" *ngIf="currentStep === 2">
        <div class="panel-header">
          <div>
            <h2>Address and Location</h2>
            <p>Enter the service address. The wizard resolves the serviceable zone from the pincode.</p>
          </div>
          <p class="status" *ngIf="selectedZone">Resolved zone: {{ selectedZone.zoneName }}</p>
        </div>

        <form class="form-grid" [formGroup]="addressForm">
          <label>
            Address Label
            <input type="text" formControlName="addressLabel" placeholder="Home / Office" />
          </label>
          <label>
            Pincode
            <input type="text" formControlName="pincode" placeholder="560001" />
          </label>
          <label class="full">
            Address Line 1
            <input type="text" formControlName="addressLine1" placeholder="Flat / building / street" />
          </label>
          <label class="full">
            Address Line 2
            <input type="text" formControlName="addressLine2" placeholder="Area / locality" />
          </label>
          <label>
            Landmark
            <input type="text" formControlName="landmark" placeholder="Optional landmark" />
          </label>
          <label>
            City
            <input type="text" formControlName="cityName" placeholder="City" />
          </label>
        </form>

        <div class="actions">
          <button type="button" class="secondary" (click)="goToStep(1)">Back</button>
          <button type="button" class="primary" (click)="resolveZoneAndContinue()" [disabled]="isWorking">
            {{ isWorking ? 'Resolving Zone...' : 'Continue' }}
          </button>
        </div>
      </section>

      <section class="panel" *ngIf="currentStep === 3">
        <div class="panel-header">
          <div>
            <h2>Slot Selection</h2>
            <p>Pick a preferred date, then choose one of the API-driven time slots for the selected zone.</p>
          </div>
        </div>

        <div class="date-picker">
          <button
            type="button"
            *ngFor="let date of availableDates"
            [class.selected]="selectedDate === date"
            (click)="changeSlotDate(date)">
            {{ friendlyDate(date) }}
          </button>
        </div>

        <div class="choice-grid slots">
          <button
            type="button"
            *ngFor="let slot of slots"
            [class.selected]="selectedSlot?.slotAvailabilityId === slot.slotAvailabilityId"
            [class.disabled]="!slot.isAvailable"
            [disabled]="!slot.isAvailable"
            (click)="selectedSlot = slot">
            <strong>{{ slot.slotLabel }}</strong>
            <span>{{ slot.startTime }} - {{ slot.endTime }}</span>
            <em>{{ slot.isAvailable ? 'Available' : 'Unavailable' }}</em>
          </button>
        </div>

        <div class="actions">
          <button type="button" class="secondary" (click)="goToStep(2)">Back</button>
          <button type="button" class="primary" (click)="goToStep(4)" [disabled]="!selectedSlot">Continue</button>
        </div>
      </section>

      <section class="panel" *ngIf="currentStep === 4">
        <div class="panel-header">
          <div>
            <h2>Contact Information</h2>
            <p>Use the same flow for guest and logged-in customers. Authenticated users will save the booking to their history.</p>
          </div>
          <p class="status" *ngIf="authService.isAuthenticated()">Signed in as {{ authService.getFullName() }}</p>
        </div>

        <form class="form-grid" [formGroup]="contactForm">
          <label>
            Customer Name
            <input type="text" formControlName="customerName" placeholder="Full name" />
          </label>
          <label>
            Mobile Number
            <input type="text" formControlName="mobileNumber" placeholder="9999999999" />
          </label>
          <label class="full">
            Email Address
            <input type="email" formControlName="emailAddress" placeholder="Optional email address" />
          </label>
        </form>

        <div class="actions">
          <button type="button" class="secondary" (click)="goToStep(3)">Back</button>
          <button type="button" class="primary" (click)="goToStep(5)">Continue</button>
        </div>
      </section>

      <section class="panel" *ngIf="currentStep === 5">
        <div class="panel-header">
          <div>
            <h2>Booking Summary</h2>
            <p>Review the service, equipment, address, slot, and customer information before confirmation.</p>
          </div>
        </div>

        <div class="summary-grid">
          <article>
            <h3>Service</h3>
            <p>{{ selectedService?.serviceName }}</p>
            <small>{{ selectedService?.summary }}</small>
          </article>
          <article>
            <h3>Equipment</h3>
            <p>{{ selectedAcType?.acTypeName }} • {{ selectedTonnage?.tonnageName }} • {{ selectedBrand?.brandName }}</p>
            <small>{{ equipmentForm.value.modelName || 'No model name' }}</small>
          </article>
          <article>
            <h3>Address</h3>
            <p>{{ addressForm.value.addressLine1 }}</p>
            <small>{{ addressForm.value.cityName }} • {{ addressForm.value.pincode }} • {{ selectedZone?.zoneName }}</small>
          </article>
          <article>
            <h3>Slot</h3>
            <p>{{ selectedSlot?.slotLabel }}</p>
            <small>{{ selectedSlot?.slotDate }} • {{ selectedSlot?.startTime }} - {{ selectedSlot?.endTime }}</small>
          </article>
          <article>
            <h3>Customer</h3>
            <p>{{ contactForm.value.customerName }}</p>
            <small>{{ contactForm.value.mobileNumber }} • {{ contactForm.value.emailAddress || 'No email provided' }}</small>
          </article>
          <article>
            <h3>Estimated Price</h3>
            <p>{{ currency(selectedService?.basePrice ?? 0) }}</p>
            <small>Pricing model: {{ selectedService?.pricingModelName }}</small>
          </article>
        </div>

        <label class="checkbox">
          <input type="checkbox" [(ngModel)]="termsAccepted" [ngModelOptions]="{ standalone: true }" />
          <span>I confirm the booking details are correct.</span>
        </label>

        <div class="actions">
          <button type="button" class="secondary" (click)="goToStep(4)">Back</button>
          <button type="button" class="primary" (click)="confirmBooking()" [disabled]="!termsAccepted || isWorking">
            {{ isWorking ? 'Confirming Booking...' : 'Confirm Booking' }}
          </button>
        </div>
      </section>

      <section class="panel success" *ngIf="currentStep === 6 && bookingSummary">
        <div class="panel-header">
          <div>
            <h2>Booking Success</h2>
            <p>Your service request has been recorded and a booking reference has been generated.</p>
          </div>
        </div>

        <div class="success-card">
          <strong>{{ bookingSummary.bookingReference }}</strong>
          <p>{{ bookingSummary.serviceName }} • {{ bookingSummary.slotDate }} • {{ bookingSummary.slotLabel }}</p>
          <small>Status: {{ bookingSummary.status }}</small>
        </div>

        <div class="actions">
          <button type="button" class="secondary" (click)="startNewBooking()">Book Another Service</button>
          <button type="button" class="primary" *ngIf="authService.isAuthenticated()" (click)="goToMyBookings()">Go to My Bookings</button>
        </div>
      </section>

      <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .page { max-width: 1120px; margin: 0 auto; padding: 24px; display: grid; gap: 20px; }
    .hero { display: grid; gap: 20px; padding: 28px; border-radius: 28px; border: 1px solid var(--coolzo-border); background:
      radial-gradient(circle at top right, rgba(15, 118, 110, 0.18), transparent 30%),
      linear-gradient(135deg, #e5faf7 0%, #ffffff 100%); }
    .eyebrow { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; color: var(--coolzo-primary); }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .hero-actions a, .actions button { border: 0; border-radius: 999px; padding: 12px 18px; text-decoration: none; font-weight: 700; cursor: pointer; }
    .hero-actions a, .primary { background: var(--coolzo-primary); color: white; }
    .secondary { background: white; color: var(--coolzo-primary-dark); border: 1px solid var(--coolzo-border); }
    .stepper { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
    .stepper button { display: grid; gap: 6px; align-items: start; text-align: left; padding: 14px; border-radius: 18px; border: 1px solid var(--coolzo-border); background: white; }
    .stepper button span { display: inline-flex; width: 28px; height: 28px; align-items: center; justify-content: center; border-radius: 999px; background: rgba(15, 118, 110, 0.12); color: var(--coolzo-primary); font-weight: 700; }
    .stepper button.active { border-color: #0f766e; box-shadow: 0 12px 28px rgba(15, 118, 110, 0.14); }
    .panel { padding: 24px; border-radius: 24px; border: 1px solid var(--coolzo-border); background: white; display: grid; gap: 20px; }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
    .status { color: var(--coolzo-primary); font-weight: 700; }
    .choice-grid { display: grid; gap: 14px; }
    .categories { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .services, .slots { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .choice-grid button { padding: 18px; border-radius: 20px; border: 1px solid var(--coolzo-border); background: #f8fffe; text-align: left; display: grid; gap: 8px; cursor: pointer; }
    .choice-grid button.selected { border-color: var(--coolzo-primary); background: rgba(15, 118, 110, 0.08); }
    .choice-grid button.disabled { opacity: 0.45; cursor: not-allowed; }
    .choice-grid em { color: var(--coolzo-primary-dark); font-style: normal; font-weight: 700; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .form-grid label { display: grid; gap: 8px; font-weight: 700; }
    .form-grid label.full { grid-column: 1 / -1; }
    input, select, textarea { width: 100%; border: 1px solid var(--coolzo-border); border-radius: 16px; padding: 12px 14px; background: #fbfffe; }
    .date-picker { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
    .date-picker button { border: 1px solid var(--coolzo-border); background: white; border-radius: 999px; padding: 10px 14px; cursor: pointer; white-space: nowrap; }
    .date-picker button.selected { background: var(--coolzo-primary); color: white; border-color: var(--coolzo-primary); }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .summary-grid article, .success-card { padding: 18px; border-radius: 18px; background: #f8fffe; border: 1px solid var(--coolzo-border); display: grid; gap: 8px; }
    .checkbox { display: flex; align-items: center; gap: 10px; font-weight: 600; }
    .checkbox input { width: auto; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
    .success { background: linear-gradient(135deg, #f3fcfa 0%, #ffffff 100%); }
    .success-card strong { font-size: 28px; color: var(--coolzo-primary-dark); }
    .error { margin: 0; padding: 14px 16px; border-radius: 14px; background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; }
    @media (max-width: 768px) {
      .page { padding: 16px; }
      .panel-header { flex-direction: column; }
      .actions { justify-content: stretch; }
      .actions button { flex: 1 1 160px; }
    }
  `]
})
export class BookingWizardComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private readonly bookingApi = inject(BookingApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly steps = ['Service', 'Equipment', 'Address', 'Slot', 'Contact', 'Summary', 'Success'];
  readonly availableDates = Array.from({ length: 7 }, (_, index) => this.toIsoDate(this.addDays(new Date(), index + 1)));

  serviceCategories: ServiceCategoryLookupResponse[] = [];
  services: ServiceLookupResponse[] = [];
  acTypes: AcTypeLookupResponse[] = [];
  tonnages: TonnageLookupResponse[] = [];
  brands: BrandLookupResponse[] = [];
  slots: SlotAvailabilityResponse[] = [];

  currentStep = 0;
  isLoadingLookups = false;
  isWorking = false;
  errorMessage = '';
  termsAccepted = false;
  selectedDate = this.availableDates[0];
  selectedCategoryId: number | null = null;
  selectedService: ServiceLookupResponse | null = null;
  selectedZone: ZoneLookupResponse | null = null;
  selectedSlot: SlotAvailabilityResponse | null = null;
  bookingSummary: BookingSummaryResponse | null = null;

  readonly equipmentForm = this.formBuilder.group({
    acTypeId: ['', Validators.required],
    tonnageId: ['', Validators.required],
    brandId: ['', Validators.required],
    modelName: [''],
    issueNotes: ['']
  });

  readonly addressForm = this.formBuilder.group({
    addressLabel: ['Home'],
    pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{4,8}$/)]],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    landmark: [''],
    cityName: ['', Validators.required]
  });

  readonly contactForm = this.formBuilder.group({
    customerName: ['', Validators.required],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{8,16}$/)]],
    emailAddress: ['', Validators.email]
  });

  get selectedAcType(): AcTypeLookupResponse | undefined {
    return this.acTypes.find((item) => item.acTypeId === Number(this.equipmentForm.value.acTypeId));
  }

  get selectedTonnage(): TonnageLookupResponse | undefined {
    return this.tonnages.find((item) => item.tonnageId === Number(this.equipmentForm.value.tonnageId));
  }

  get selectedBrand(): BrandLookupResponse | undefined {
    return this.brands.find((item) => item.brandId === Number(this.equipmentForm.value.brandId));
  }

  async ngOnInit(): Promise<void> {
    const session = this.authService.currentSession();

    if (session) {
      this.contactForm.patchValue({
        customerName: session.fullName,
        emailAddress: session.email
      });
    }

    await this.loadLookups();
  }

  async selectCategory(category: ServiceCategoryLookupResponse): Promise<void> {
    this.selectedCategoryId = category.serviceCategoryId;
    this.selectedService = null;
    this.services = await this.bookingApi.getServices(category.serviceCategoryId);
  }

  async resolveZoneAndContinue(): Promise<void> {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isWorking = true;
    this.errorMessage = '';

    try {
      this.selectedZone = await this.bookingApi.resolveZone(this.addressForm.value.pincode ?? '');
      await this.loadSlots();
      this.currentStep = 3;
    } catch (error) {
      this.errorMessage = this.readError(error, 'Unable to resolve the serviceable zone for this pincode.');
    } finally {
      this.isWorking = false;
    }
  }

  async changeSlotDate(date: string): Promise<void> {
    this.selectedDate = date;
    this.selectedSlot = null;

    try {
      await this.loadSlots();
    } catch (error) {
      this.errorMessage = this.readError(error, 'Unable to refresh slots for the selected date.');
    }
  }

  goToStep(step: number): void {
    if (step === 1 && !this.selectedService) {
      this.errorMessage = 'Please select a service to continue.';
      return;
    }

    if (step === 2 && this.equipmentForm.invalid) {
      this.equipmentForm.markAllAsTouched();
      this.errorMessage = 'Please complete the equipment details before continuing.';
      return;
    }

    if (step === 4 && !this.selectedSlot) {
      this.errorMessage = 'Please choose a preferred slot before continuing.';
      return;
    }

    if (step === 5 && this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.errorMessage = 'Please provide valid customer contact information.';
      return;
    }

    this.errorMessage = '';
    this.currentStep = step;
  }

  async confirmBooking(): Promise<void> {
    if (!this.selectedService || !this.selectedSlot || !this.selectedZone) {
      this.errorMessage = 'Service, zone, and slot selection are required to create a booking.';
      return;
    }

    this.isWorking = true;
    this.errorMessage = '';

    const payload = {
      serviceId: this.selectedService.serviceId,
      acTypeId: Number(this.equipmentForm.value.acTypeId),
      tonnageId: Number(this.equipmentForm.value.tonnageId),
      brandId: Number(this.equipmentForm.value.brandId),
      slotAvailabilityId: this.selectedSlot.slotAvailabilityId,
      customerName: this.contactForm.value.customerName ?? '',
      mobileNumber: this.contactForm.value.mobileNumber ?? '',
      emailAddress: this.contactForm.value.emailAddress ?? '',
      addressLine1: this.addressForm.value.addressLine1 ?? '',
      addressLine2: this.addressForm.value.addressLine2 ?? '',
      landmark: this.addressForm.value.landmark ?? '',
      cityName: this.addressForm.value.cityName ?? '',
      pincode: this.addressForm.value.pincode ?? '',
      addressLabel: this.addressForm.value.addressLabel ?? '',
      modelName: this.equipmentForm.value.modelName ?? '',
      issueNotes: this.equipmentForm.value.issueNotes ?? '',
      sourceChannel: 'Web'
    };

    try {
      this.bookingSummary = this.authService.isAuthenticated()
        ? await this.bookingApi.createCustomerBooking(payload)
        : await this.bookingApi.createGuestBooking(payload);

      this.currentStep = 6;
    } catch (error) {
      this.errorMessage = this.readError(error, 'We could not confirm the booking right now.');
    } finally {
      this.isWorking = false;
    }
  }

  startNewBooking(): void {
    this.currentStep = 0;
    this.selectedCategoryId = null;
    this.selectedService = null;
    this.selectedZone = null;
    this.selectedSlot = null;
    this.bookingSummary = null;
    this.services = [];
    this.slots = [];
    this.termsAccepted = false;
    this.selectedDate = this.availableDates[0];
    this.equipmentForm.reset({ acTypeId: '', tonnageId: '', brandId: '', modelName: '', issueNotes: '' });
    this.addressForm.reset({ addressLabel: 'Home', pincode: '', addressLine1: '', addressLine2: '', landmark: '', cityName: '' });
    this.contactForm.reset({
      customerName: this.authService.currentSession()?.fullName ?? '',
      mobileNumber: '',
      emailAddress: this.authService.currentSession()?.email ?? ''
    });
  }

  goToMyBookings(): void {
    void this.router.navigate(['/my-bookings']);
  }

  friendlyDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  currency(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }

  private async loadLookups(): Promise<void> {
    this.isLoadingLookups = true;

    try {
      const [serviceCategories, acTypes, tonnages, brands] = await Promise.all([
        this.bookingApi.getServiceCategories(),
        this.bookingApi.getAcTypes(),
        this.bookingApi.getTonnages(),
        this.bookingApi.getBrands()
      ]);

      this.serviceCategories = serviceCategories;
      this.acTypes = acTypes;
      this.tonnages = tonnages;
      this.brands = brands;
    } catch (error) {
      this.errorMessage = this.readError(error, 'We could not load the booking lookups.');
    } finally {
      this.isLoadingLookups = false;
    }
  }

  private async loadSlots(): Promise<void> {
    if (!this.selectedZone) {
      return;
    }

    this.slots = await this.bookingApi.getSlots(this.selectedZone.zoneId, this.selectedDate);
  }

  private addDays(date: Date, amount: number): Date {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + amount);
    return nextDate;
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private readError(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: string } })?.error?.message;
    return message ?? fallback;
  }
}
