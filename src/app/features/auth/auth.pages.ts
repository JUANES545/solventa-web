import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore } from '../../core/app-store.service';
import { SvgIconComponent } from '../../shared/svg-icon.component';
import { postLoginRoute } from '../../core/session-routing';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, SvgIconComponent],
  template: `
    <section class="auth-page">
      <div class="auth-panel">
        <span class="eyebrow">Solventa</span>
        <h1>{{ 'auth.title' | transloco }}</h1>
        <p>{{ 'auth.subtitle' | transloco }}</p>
        @if (expired()) {
          <div class="inline-alert warning" role="alert">
            <app-icon name="clock" [size]="19" />{{ 'auth.expired' | transloco }}
          </div>
        }
        @if (error()) {
          <div class="inline-alert error" role="alert">
            <app-icon name="error" [size]="19" />{{ error()! | transloco }}
          </div>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label for="login-email">{{ 'auth.email' | transloco }}</label
          ><input
            id="login-email"
            type="email"
            autocomplete="email"
            formControlName="email"
            [attr.aria-invalid]="showError('email')"
          />
          @if (showError('email')) {
            <span class="field-error">{{ 'common.invalidEmail' | transloco }}</span>
          }
          <label for="login-password">{{ 'auth.password' | transloco }}</label
          ><input
            id="login-password"
            type="password"
            autocomplete="current-password"
            formControlName="password"
            [attr.aria-invalid]="showError('password')"
          />
          @if (showError('password')) {
            <span class="field-error">{{ 'common.required' | transloco }}</span>
          }
          <button class="button primary full" type="submit" [disabled]="loading()">
            {{ (loading() ? 'common.loading' : 'auth.signIn') | transloco }}
          </button>
        </form>
        <button
          class="button secondary full"
          type="button"
          (click)="demoLogin()"
          [disabled]="loading()"
        >
          {{ 'auth.demo' | transloco }}
        </button>
        <p class="demo-hint">{{ 'auth.demoHint' | transloco }}</p>
        <p class="demo-hint">{{ 'auth.advisorDemoHint' | transloco }}</p>
        <div class="auth-links">
          <a routerLink="/recover-password">{{ 'auth.forgot' | transloco }}</a
          ><a routerLink="/register">{{ 'auth.register' | transloco }}</a>
        </div>
      </div>
    </section>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly expired = signal(this.route.snapshot.queryParamMap.get('expired') === '1');
  readonly form = this.fb.nonNullable.group({
    email: ['demo@solventa.co', [Validators.required, Validators.email]],
    password: ['Solventa123', Validators.required],
  });

  showError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.store.login(email, password).subscribe({
      next: () => this.goAfterLogin(),
      error: (error) => {
        this.loading.set(false);
        this.error.set(
          error?.constructor?.name === 'InvalidCredentialsError'
            ? 'auth.invalid'
            : 'errors.network',
        );
      },
    });
  }
  demoLogin(): void {
    this.loading.set(true);
    this.error.set(null);
    this.store.loginAsDemo().subscribe({
      next: () => this.goAfterLogin(),
      error: () => {
        this.loading.set(false);
        this.error.set('errors.network');
      },
    });
  }
  private goAfterLogin(): void {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    void this.router.navigateByUrl(postLoginRoute(this.store.role(), requested));
  }
}

@Component({
  selector: 'app-recovery-page',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, SvgIconComponent],
  template: `<section class="auth-page">
    <div class="auth-panel">
      <a class="back-link" routerLink="/access"
        ><app-icon name="arrow-left" [size]="17" />{{ 'common.back' | transloco }}</a
      >
      <h1>{{ 'auth.resetTitle' | transloco }}</h1>
      <p>{{ 'auth.resetBody' | transloco }}</p>
      @if (success()) {
        <div class="inline-alert success" role="status">
          <app-icon name="check" [size]="19" />{{ 'auth.resetSuccess' | transloco }}
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label for="reset-email">{{ 'auth.email' | transloco }}</label
          ><input id="reset-email" type="email" autocomplete="email" formControlName="email" />
          @if (form.controls.email.invalid && form.controls.email.touched) {
            <span class="field-error">{{ 'common.invalidEmail' | transloco }}</span>
          }
          <button class="button primary full" type="submit" [disabled]="loading()">
            {{ (loading() ? 'common.loading' : 'auth.resetAction') | transloco }}
          </button>
        </form>
      }
    </div>
  </section>`,
})
export class RecoveryPage {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(AppStore);
  readonly loading = signal(false);
  readonly success = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.store.requestPasswordReset(this.form.controls.email.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.success.set(true);
      },
    });
  }
}

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, SvgIconComponent],
  template: `<section class="auth-page">
    <div class="auth-panel wide">
      <span class="eyebrow">Solventa</span>
      <h1>{{ 'register.title' | transloco }}</h1>
      <p>{{ 'register.subtitle' | transloco }}</p>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <div>
            <label for="full-name">{{ 'register.fullName' | transloco }}</label
            ><input id="full-name" autocomplete="name" formControlName="fullName" />
          </div>
          <div>
            <label for="document">{{ 'register.document' | transloco }}</label
            ><input id="document" inputmode="numeric" formControlName="documentNumber" />
          </div>
          <div>
            <label for="register-email">{{ 'register.email' | transloco }}</label
            ><input id="register-email" type="email" autocomplete="email" formControlName="email" />
          </div>
          <div>
            <label for="register-password">{{ 'register.password' | transloco }}</label
            ><input
              id="register-password"
              type="password"
              autocomplete="new-password"
              formControlName="password"
            />
          </div>
        </div>
        @if (form.invalid && form.touched) {
          <div class="form-error-summary" role="alert">{{ 'common.required' | transloco }}</div>
        }
        <button class="button primary full" type="submit" [disabled]="loading()">
          {{ (loading() ? 'common.loading' : 'common.continue') | transloco
          }}<app-icon name="arrow-right" [size]="18" />
        </button>
      </form>
      <a class="center-link" routerLink="/access">{{ 'register.haveAccount' | transloco }}</a>
    </div>
  </section>`,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  readonly loading = signal(false);
  readonly form = this.fb.nonNullable.group({
    fullName: ['Valentina Gómez', [Validators.required, Validators.minLength(3)]],
    documentNumber: ['1020304050', Validators.required],
    email: ['demo@solventa.co', [Validators.required, Validators.email]],
    password: ['Solventa123', [Validators.required, Validators.minLength(8)]],
  });
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { password: _password, ...customer } = this.form.getRawValue();
    this.store.register(customer).subscribe({
      next: () => void this.router.navigate(['/consent']),
      error: () => this.loading.set(false),
    });
  }
}
