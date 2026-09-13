import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore } from '../../core/app-store.service';
import { CopPipe } from '../../shared/format.pipes';
import { SvgIconComponent } from '../../shared/svg-icon.component';
import { PolicySealSceneComponent } from '../../shared/three/policy-seal-scene.component';
import {
  PlanComparisonComponent,
  TravelDetailsFormComponent,
  TravelQuoteRequest,
} from '../../shared/travel-quote.components';

@Component({
  selector: 'app-quote-page',
  imports: [TranslocoPipe, TravelDetailsFormComponent],
  template: `<section class="page-stack form-page quote-page">
    <div class="page-heading">
      <span class="eyebrow">1 / 4 · {{ 'nav.quote' | transloco }}</span>
      <h1>{{ 'quote.title' | transloco }}</h1>
      <p>{{ 'quote.subtitle' | transloco }}</p>
    </div>
    <app-travel-details-form
      [initialDetails]="store.travelDetails()"
      (submitted)="submit($event)"
    />
  </section>`,
})
export class QuotePage {
  readonly store = inject(AppStore);
  private router = inject(Router);
  submit(request: TravelQuoteRequest): void {
    this.store.setTravelDetails(request.details);
    sessionStorage.setItem('solventa.demo.personalized', String(request.personalized));
    void this.router.navigate(['/app/plans']);
  }
}

@Component({
  selector: 'app-plans-page',
  imports: [RouterLink, TranslocoPipe, SvgIconComponent, PlanComparisonComponent],
  template: `<section class="page-stack">
    <div class="page-heading">
      <span class="eyebrow">2 / 4 · {{ 'nav.quote' | transloco }}</span>
      <h1>{{ 'plans.title' | transloco }}</h1>
      <p>{{ 'plans.subtitle' | transloco }}</p>
    </div>
    <app-plan-comparison
      [plans]="store.plans()"
      [status]="planStatus"
      (planSelected)="select($event)"
      (retry)="load()"
    />
    <div class="form-actions">
      <a class="back-link" routerLink="/app/quote"
        ><app-icon name="arrow-left" [size]="17" />{{ 'common.back' | transloco }}</a
      >
    </div>
  </section>`,
})
export class PlansPage implements OnInit {
  readonly store = inject(AppStore);
  private router = inject(Router);
  readonly loading = signal(true);
  readonly error = signal(false);
  get planStatus(): import('../../models/domain.models').AsyncStatus {
    if (this.loading()) return 'loading';
    return this.error() ? 'error' : this.store.plans().length ? 'success' : 'empty';
  }
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
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, CopPipe, SvgIconComponent],
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
          <li><app-icon name="check" [size]="18" />{{ 'plans.medical' | transloco }}</li>
          <li><app-icon name="check" [size]="18" />{{ 'plans.baggage' | transloco }}</li>
          <li><app-icon name="check" [size]="18" />{{ 'plans.delay' | transloco }}</li>
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
        <a class="back-link" routerLink="/app/plans"
          ><app-icon name="arrow-left" [size]="17" />{{ 'common.back' | transloco }}</a
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
  imports: [RouterLink, TranslocoPipe, CopPipe, SvgIconComponent],
  template: `<section class="page-stack form-page">
    <div class="page-heading">
      <span class="eyebrow">4 / 4 · {{ 'payment.title' | transloco }}</span>
      <h1>{{ 'payment.title' | transloco }}</h1>
      <p>{{ 'payment.subtitle' | transloco }}</p>
    </div>
    <section class="panel payment-panel">
      <label class="payment-method"
        ><input type="radio" checked name="payment" /><span class="card-icon"
          ><app-icon name="card" [size]="25" /></span
        ><span
          ><strong>{{ 'payment.card' | transloco }}</strong
          ><small>{{ 'payment.safe' | transloco }}</small></span
        ><strong>{{ store.selectedPlan()!.priceCop | cop }}</strong></label
      >
      @if (error()) {
        <div class="inline-alert error" role="alert">{{ 'payment.rejected' | transloco }}</div>
      }
      @if (success()) {
        <div class="inline-alert success" role="status">
          <app-icon name="check" [size]="19" />{{ 'payment.approved' | transloco }}
        </div>
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
  imports: [ReactiveFormsModule, TranslocoPipe, SvgIconComponent],
  template: `<section class="page-stack form-page">
    <div class="auth-panel centered">
      <span class="security-mark"><app-icon name="lock" [size]="20" /></span>
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
  imports: [RouterLink, TranslocoPipe, PolicySealSceneComponent, SvgIconComponent],
  template: `<section class="success-page">
    <app-policy-seal-scene />
    <span class="eyebrow">Solventa</span>
    <h1>{{ 'issued.title' | transloco }}</h1>
    <p>{{ 'issued.body' | transloco }}</p>
    <div class="policy-reference">
      <span>{{ 'issued.policy' | transloco }}</span
      ><strong>{{ store.issuedPolicy()?.id }}</strong>
    </div>
    <div class="button-row centered">
      <a class="button conversion" [routerLink]="['/app/policies', store.issuedPolicy()?.id]"
        >{{ 'issued.view' | transloco }}<app-icon name="policy" [size]="18" /></a
      ><a class="button secondary" routerLink="/app/dashboard">{{
        'issued.dashboard' | transloco
      }}</a>
    </div>
  </section>`,
})
export class IssuedPage {
  readonly store = inject(AppStore);
}
