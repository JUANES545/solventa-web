import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore } from '../../core/app-store.service';
import { CopPipe } from '../../shared/format.pipes';
import { ErrorStateComponent, LoadingStateComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-quote-page',
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `<section class="page-stack form-page">
    <div class="page-heading">
      <span class="eyebrow">1 / 4 · {{ 'nav.quote' | transloco }}</span>
      <h1>{{ 'quote.title' | transloco }}</h1>
      <p>{{ 'quote.subtitle' | transloco }}</p>
    </div>
    <form class="panel form-panel" [formGroup]="form" (ngSubmit)="submit()">
      <div class="form-grid">
        <div class="span-two">
          <label for="destination">{{ 'quote.destination' | transloco }}</label
          ><input
            id="destination"
            formControlName="destination"
            autocomplete="country-name"
            placeholder="España"
          />
        </div>
        <div>
          <label for="departure">{{ 'quote.departure' | transloco }}</label
          ><input id="departure" type="date" formControlName="departureDate" />
        </div>
        <div>
          <label for="return">{{ 'quote.return' | transloco }}</label
          ><input id="return" type="date" formControlName="returnDate" />
        </div>
        <div>
          <label for="travelers">{{ 'quote.travelers' | transloco }}</label
          ><input id="travelers" type="number" min="1" max="8" formControlName="travelers" />
        </div>
      </div>
      <label class="choice-row optional"
        ><input type="checkbox" formControlName="personalized" /><span
          ><strong>{{ 'quote.consent' | transloco }}</strong
          ><small>{{ 'quote.consentHint' | transloco }}</small></span
        ></label
      >
      @if (dateError()) {
        <div class="inline-alert error" role="alert">{{ 'quote.dateError' | transloco }}</div>
      }
      @if (form.invalid && form.touched) {
        <div class="form-error-summary" role="alert">{{ 'common.required' | transloco }}</div>
      }
      <div class="form-actions">
        <button class="button conversion" type="submit">{{ 'quote.calculate' | transloco }}</button>
      </div>
    </form>
  </section>`,
})
export class QuotePage {
  private fb = inject(FormBuilder);
  private store = inject(AppStore);
  private router = inject(Router);
  readonly dateError = signal(false);
  readonly form = this.fb.nonNullable.group({
    destination: [this.store.travelDetails()?.destination ?? 'España', Validators.required],
    departureDate: [this.store.travelDetails()?.departureDate ?? '2026-10-04', Validators.required],
    returnDate: [this.store.travelDetails()?.returnDate ?? '2026-10-19', Validators.required],
    travelers: [
      this.store.travelDetails()?.travelers ?? 1,
      [Validators.required, Validators.min(1), Validators.max(8)],
    ],
    personalized: [true],
  });
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { personalized, ...details } = this.form.getRawValue();
    if (details.returnDate <= details.departureDate) {
      this.dateError.set(true);
      return;
    }
    this.store.setTravelDetails(details);
    sessionStorage.setItem('solventa.demo.personalized', String(personalized));
    void this.router.navigate(['/app/plans']);
  }
}

@Component({
  selector: 'app-plans-page',
  imports: [RouterLink, TranslocoPipe, CopPipe, LoadingStateComponent, ErrorStateComponent],
  template: `<section class="page-stack">
    <div class="page-heading">
      <span class="eyebrow">2 / 4 · {{ 'nav.quote' | transloco }}</span>
      <h1>{{ 'plans.title' | transloco }}</h1>
      <p>{{ 'plans.subtitle' | transloco }}</p>
    </div>
    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state messageKey="plans.unavailable" (retry)="load()" />
    } @else {
      <div class="plan-grid">
        @for (plan of store.plans(); track plan.id) {
          <article class="plan-card" [class.recommended]="plan.recommended">
            @if (plan.recommended) {
              <span class="recommended-label">{{ 'plans.recommended' | transloco }}</span>
            }
            <h2>{{ 'plans.' + plan.id | transloco }}</h2>
            <div class="plan-price">
              <strong>{{ plan.priceCop | cop }}</strong
              ><small>{{ 'plans.perTrip' | transloco }}</small>
            </div>
            <ul>
              <li>
                <span>✓</span>{{ 'plans.medical' | transloco }}
                <strong>{{ plan.medicalCoverageCop | cop }}</strong>
              </li>
              <li>
                <span>✓</span>{{ 'plans.baggage' | transloco }}
                <strong>{{ plan.baggageCoverageCop | cop }}</strong>
              </li>
              <li>
                <span>✓</span>{{ 'plans.delay' | transloco }}
                <strong>{{ plan.delayCoverageCop | cop }}</strong>
              </li>
            </ul>
            <button
              class="button full"
              [class.conversion]="plan.recommended"
              [class.primary]="!plan.recommended"
              type="button"
              (click)="select(plan)"
            >
              {{ 'plans.select' | transloco }}
            </button>
          </article>
        }
      </div>
    }
    <div class="form-actions">
      <a class="back-link" routerLink="/app/quote">← {{ 'common.back' | transloco }}</a>
    </div>
  </section>`,
})
export class PlansPage implements OnInit {
  readonly store = inject(AppStore);
  private router = inject(Router);
  readonly loading = signal(true);
  readonly error = signal(false);
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(false);
    const personalized = sessionStorage.getItem('solventa.demo.personalized') !== 'false';
    this.store.calculatePlans(personalized).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
  select(plan: import('../../models/domain.models').TravelPlan): void {
    this.store.choosePlan(plan);
    void this.router.navigate(['/app/checkout']);
  }
}

@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CopPipe],
  template: `<section class="page-stack form-page">
    <div class="page-heading">
      <span class="eyebrow">3 / 4 · {{ 'checkout.title' | transloco }}</span>
      <h1>{{ 'checkout.title' | transloco }}</h1>
    </div>
    <div class="checkout-grid">
      <section class="panel">
        <h2>{{ 'checkout.plan' | transloco }}</h2>
        <div class="checkout-plan">
          <strong>{{ 'plans.' + store.selectedPlan()!.id | transloco }}</strong
          ><strong>{{ store.selectedPlan()!.priceCop | cop }}</strong>
        </div>
        <ul class="coverage-list">
          <li><span>✓</span>{{ 'plans.medical' | transloco }}</li>
          <li><span>✓</span>{{ 'plans.baggage' | transloco }}</li>
          <li><span>✓</span>{{ 'plans.delay' | transloco }}</li>
        </ul>
      </section>
      <section class="panel">
        <h2>{{ 'checkout.trip' | transloco }}</h2>
        <dl class="profile-details">
          <div>
            <dt>{{ 'quote.destination' | transloco }}</dt>
            <dd>{{ store.travelDetails()?.destination }}</dd>
          </div>
          <div>
            <dt>{{ 'quote.travelers' | transloco }}</dt>
            <dd>{{ store.travelDetails()?.travelers }}</dd>
          </div>
          <div>
            <dt>{{ 'checkout.customer' | transloco }}</dt>
            <dd>{{ store.customer()?.fullName }}</dd>
          </div>
        </dl>
      </section>
    </div>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label class="choice-row"
        ><input type="checkbox" formControlName="confirmed" /><span>{{
          'checkout.terms' | transloco
        }}</span></label
      >
      @if (error()) {
        <div class="inline-alert error" role="alert">{{ 'checkout.required' | transloco }}</div>
      }
      <div class="form-actions between">
        <a class="back-link" routerLink="/app/plans">← {{ 'common.back' | transloco }}</a
        ><button class="button conversion" type="submit">{{ 'checkout.pay' | transloco }}</button>
      </div>
    </form>
  </section>`,
})
export class CheckoutPage {
  readonly store = inject(AppStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly error = signal(false);
  readonly form = this.fb.nonNullable.group({ confirmed: [false, Validators.requiredTrue] });
  submit(): void {
    if (this.form.invalid) {
      this.error.set(true);
      return;
    }
    void this.router.navigate(['/app/payment']);
  }
}

@Component({
  selector: 'app-payment-page',
  imports: [RouterLink, TranslocoPipe, CopPipe],
  template: `<section class="page-stack form-page">
    <div class="page-heading">
      <span class="eyebrow">4 / 4 · {{ 'payment.title' | transloco }}</span>
      <h1>{{ 'payment.title' | transloco }}</h1>
      <p>{{ 'payment.subtitle' | transloco }}</p>
    </div>
    <section class="panel payment-panel">
      <label class="payment-method"
        ><input type="radio" checked name="payment" /><span class="card-icon" aria-hidden="true"
          >▰</span
        ><span
          ><strong>{{ 'payment.card' | transloco }}</strong
          ><small>{{ 'payment.safe' | transloco }}</small></span
        ><strong>{{ store.selectedPlan()!.priceCop | cop }}</strong></label
      >
      @if (error()) {
        <div class="inline-alert error" role="alert">{{ 'payment.rejected' | transloco }}</div>
      }
      @if (success()) {
        <div class="inline-alert success" role="status">✓ {{ 'payment.approved' | transloco }}</div>
      }
      <button
        class="button conversion full"
        type="button"
        (click)="pay()"
        [disabled]="loading() || success()"
      >
        {{ (loading() ? 'payment.processing' : 'payment.action') | transloco }}
      </button>
    </section>
    @if (success()) {
      <div class="form-actions end">
        <a class="button primary" routerLink="/app/otp">{{ 'common.continue' | transloco }}</a>
      </div>
    }
  </section>`,
})
export class PaymentPage {
  readonly store = inject(AppStore);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly success = signal(false);
  pay(): void {
    this.loading.set(true);
    this.error.set(false);
    this.store.submitPayment().subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}

@Component({
  selector: 'app-otp-page',
  imports: [ReactiveFormsModule, TranslocoPipe],
  template: `<section class="page-stack form-page">
    <div class="auth-panel centered">
      <span class="eyebrow">Solventa Secure</span>
      <h1>{{ 'otp.title' | transloco }}</h1>
      <p>{{ 'otp.body' | transloco }}</p>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label for="otp">{{ 'otp.label' | transloco }}</label
        ><input
          class="otp-input"
          id="otp"
          inputmode="numeric"
          maxlength="6"
          autocomplete="one-time-code"
          formControlName="otp"
        />
        @if (error()) {
          <div class="inline-alert error" role="alert">{{ 'otp.invalid' | transloco }}</div>
        }
        <button class="button conversion full" type="submit" [disabled]="loading()">
          {{ (loading() ? 'otp.processing' : 'otp.action') | transloco }}
        </button>
      </form>
    </div>
  </section>`,
})
export class OtpPage {
  private fb = inject(FormBuilder);
  private store = inject(AppStore);
  private router = inject(Router);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly form = this.fb.nonNullable.group({
    otp: ['123456', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });
  submit(): void {
    if (this.form.invalid || !this.store.verifyOtp(this.form.controls.otp.value)) {
      this.error.set(true);
      return;
    }
    this.loading.set(true);
    this.store.issuePolicy().subscribe({
      next: () => void this.router.navigate(['/app/issued']),
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}

@Component({
  selector: 'app-issued-page',
  imports: [RouterLink, TranslocoPipe],
  template: `<section class="success-page">
    <div class="success-illustration">✓</div>
    <span class="eyebrow">Solventa</span>
    <h1>{{ 'issued.title' | transloco }}</h1>
    <p>{{ 'issued.body' | transloco }}</p>
    <div class="policy-reference">
      <span>{{ 'issued.policy' | transloco }}</span
      ><strong>{{ store.issuedPolicy()?.id }}</strong>
    </div>
    <div class="button-row centered">
      <a class="button conversion" [routerLink]="['/app/policies', store.issuedPolicy()?.id]">{{
        'issued.view' | transloco
      }}</a
      ><a class="button secondary" routerLink="/app/dashboard">{{
        'issued.dashboard' | transloco
      }}</a>
    </div>
  </section>`,
})
export class IssuedPage {
  readonly store = inject(AppStore);
}
