import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="panel">
      <div>
        <h1>Coolzo Web</h1>
        <p>Sign in to access the Phase 0 web foundation.</p>
      </div>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Username or Email
          <input type="text" formControlName="userNameOrEmail">
        </label>
        <label>
          Password
          <input type="password" formControlName="password">
        </label>
        <button type="submit" [disabled]="isSubmitting || form.invalid">
          {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>
      <p class="helper">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .panel { width: min(420px, calc(100% - 32px)); margin: 80px auto; background: white; border-radius: 20px; border: 1px solid var(--coolzo-border); padding: 32px; display: grid; gap: 20px; }
    form { display: grid; gap: 16px; }
    label { display: grid; gap: 8px; font-weight: 600; }
    input { border: 1px solid var(--coolzo-border); border-radius: 12px; padding: 12px 14px; }
    button { background: var(--coolzo-primary); color: white; border: 0; border-radius: 999px; padding: 12px 18px; cursor: pointer; }
    .helper { min-height: 20px; color: #b91c1c; }
  `]
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  readonly form = this.formBuilder.group({
    userNameOrEmail: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      await this.authService.login(
        this.form.controls.userNameOrEmail.value ?? '',
        this.form.controls.password.value ?? ''
      );

      await this.router.navigate(['/dashboard']);
    } catch {
      this.errorMessage = 'Unable to sign in with the current credentials.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
