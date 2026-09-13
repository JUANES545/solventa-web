import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { AsyncStatus, TravelDetails, TravelPlan } from '../models/domain.models';
import { CopPipe, LocalDatePipe } from './format.pipes';
import { SvgIconComponent } from './svg-icon.component';
import { ErrorStateComponent, LoadingStateComponent } from './ui.components';

export interface TravelQuoteRequest {
  details: TravelDetails;
  personalized: boolean;
}

@Component({
  selector: 'app-travel-details-form',
  imports: [ReactiveFormsModule, TranslocoPipe, LocalDatePipe, SvgIconComponent],
  template: `<div class="quote-layout">
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
      @if (personalizationEnabled()) {
        <label class="choice-row optional"
          ><input type="checkbox" formControlName="personalized" /><span
            ><strong>{{ 'quote.consent' | transloco }}</strong
            ><small>{{ 'quote.consentHint' | transloco }}</small></span
          ></label
        >
      }
      @if (dateError()) {
        <div class="inline-alert error" role="alert">
          <app-icon name="error" [size]="19" />{{ 'quote.dateError' | transloco }}
        </div>
      }
      @if (form.invalid && form.touched) {
        <div class="form-error-summary" role="alert">{{ 'common.required' | transloco }}</div>
      }
      <div class="form-actions">
        <button class="button conversion" type="submit">
          {{ submitLabelKey() | transloco }}<app-icon name="arrow-right" [size]="18" />
        </button>
      </div>
    </form>
    <aside class="route-preview" [attr.aria-label]="'quote.routeTitle' | transloco">
      <div class="route-preview-heading">
        <span class="route-icon"><app-icon name="globe" [size]="22" /></span>
        <div>
          <small>{{ 'quote.routeEyebrow' | transloco }}</small>
          <h2>{{ 'quote.routeTitle' | transloco }}</h2>
        </div>
      </div>
      <svg viewBox="0 0 360 168" role="img" [attr.aria-label]="'quote.routeGraphic' | transloco">
        <defs>
          <linearGradient id="route-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#75edff" />
            <stop offset="1" stop-color="#0b7fa3" />
          </linearGradient>
        </defs>
        <path class="route-grid-line" d="M28 114C102 8 252 8 332 114" />
        <path class="route-flight-line" d="M28 114C102 8 252 8 332 114" />
        <circle cx="28" cy="114" r="7" />
        <circle cx="332" cy="114" r="7" />
        <g class="route-plane" transform="translate(180 35) rotate(20)">
          <path d="m-11 5 22-10-6 13-5-2-4 5-2-7z" />
        </g>
      </svg>
      <div class="route-endpoints">
        <span
          ><app-icon name="location" [size]="17" /><small>{{
            'quote.routeOrigin' | transloco
          }}</small
          ><strong>Bogotá</strong></span
        >
        <span
          ><app-icon name="location" [size]="17" /><small>{{
            'quote.destination' | transloco
          }}</small
          ><strong>{{ form.controls.destination.value || '—' }}</strong></span
        >
      </div>
      <div class="route-dates">
        <span>{{ form.controls.departureDate.value | localDate }}</span>
        <span>{{ form.controls.returnDate.value | localDate }}</span>
      </div>
    </aside>
  </div>`,
})
export class TravelDetailsFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly initialDetails = input<TravelDetails | null>(null);
  readonly personalizationEnabled = input(true);
  readonly submitLabelKey = input('quote.calculate');
  readonly submitted = output<TravelQuoteRequest>();
  readonly dateError = signal(false);
  readonly form = this.fb.nonNullable.group({
    destination: ['España', Validators.required],
    departureDate: ['2026-10-04', Validators.required],
    returnDate: ['2026-10-19', Validators.required],
    travelers: [1, [Validators.required, Validators.min(1), Validators.max(8)]],
    personalized: [true],
  });

  constructor() {
    effect(() => {
      const details = this.initialDetails();
      if (details) this.form.patchValue(details, { emitEvent: false });
    });
  }

  submit(): void {
    this.dateError.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { personalized, ...details } = this.form.getRawValue();
    if (details.returnDate <= details.departureDate) {
      this.dateError.set(true);
      return;
    }
    this.submitted.emit({
      details,
      personalized: this.personalizationEnabled() ? personalized : false,
    });
  }
}

@Component({
  selector: 'app-plan-comparison',
  imports: [TranslocoPipe, CopPipe, SvgIconComponent, LoadingStateComponent, ErrorStateComponent],
  template: `@if (status() === 'loading') {
      <app-loading-state />
    } @else if (status() === 'error') {
      <app-error-state messageKey="plans.unavailable" (retry)="retry.emit()" />
    } @else if (status() === 'empty') {
      <div class="empty-state">
        <p>{{ 'plans.unavailable' | transloco }}</p>
      </div>
    } @else if (status() === 'success') {
      <div class="plan-grid">
        @for (plan of plans(); track plan.id) {
          <article
            class="plan-card"
            [class.recommended]="plan.recommended"
            [class.selected]="selectedPlan()?.id === plan.id"
          >
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
                <app-icon name="check" [size]="18" />{{ 'plans.medical' | transloco }}
                <strong>{{ plan.medicalCoverageCop | cop }}</strong>
              </li>
              <li>
                <app-icon name="check" [size]="18" />{{ 'plans.baggage' | transloco }}
                <strong>{{ plan.baggageCoverageCop | cop }}</strong>
              </li>
              <li>
                <app-icon name="check" [size]="18" />{{ 'plans.delay' | transloco }}
                <strong>{{ plan.delayCoverageCop | cop }}</strong>
              </li>
            </ul>
            <button
              class="button full"
              [class.conversion]="plan.recommended"
              [class.primary]="!plan.recommended"
              type="button"
              [attr.aria-pressed]="selectedPlan()?.id === plan.id"
              (click)="planSelected.emit(plan)"
            >
              {{ selectLabelKey() | transloco }}<app-icon name="arrow-right" [size]="18" />
            </button>
          </article>
        }
      </div>
    }`,
})
export class PlanComparisonComponent {
  readonly plans = input.required<TravelPlan[]>();
  readonly status = input.required<AsyncStatus>();
  readonly selectedPlan = input<TravelPlan | null>(null);
  readonly selectLabelKey = input('plans.select');
  readonly planSelected = output<TravelPlan>();
  readonly retry = output<void>();
}
