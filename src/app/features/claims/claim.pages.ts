import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore } from '../../core/app-store.service';
import { LocalDatePipe } from '../../shared/format.pipes';
import { LoadingStateComponent, SimulationNoticeComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-claims-page',
  imports: [RouterLink, TranslocoPipe, LocalDatePipe, LoadingStateComponent],
  template: `<section class="page-stack">
    <div class="page-heading split">
      <div>
        <span class="eyebrow">Solventa</span>
        <h1>{{ 'claims.title' | transloco }}</h1>
        <p>{{ 'claims.subtitle' | transloco }}</p>
      </div>
      <a class="button conversion" routerLink="/app/claims/new">{{ 'claims.new' | transloco }}</a>
    </div>
    @if (loading()) {
      <app-loading-state />
    } @else if (!store.claims().length) {
      <div class="empty-state">
        <span>◇</span>
        <p>{{ 'claims.empty' | transloco }}</p>
        <a class="button primary" routerLink="/app/claims/new">{{ 'claims.new' | transloco }}</a>
      </div>
    } @else {
      <div class="data-list">
        @for (claim of store.claims(); track claim.id) {
          <a class="data-row interactive" [routerLink]="['/app/claims', claim.id]"
            ><div>
              <strong>{{ 'claims.' + claim.type | transloco }}</strong
              ><small>{{ claim.id }} · {{ claim.eventDate | localDate }}</small>
            </div>
            <span class="status" [class]="'status ' + claim.status">{{
              'claims.' + claim.status | transloco
            }}</span
            ><span aria-hidden="true">→</span></a
          >
        }
      </div>
    }
  </section>`,
})
export class ClaimsPage implements OnInit {
  readonly store = inject(AppStore);
  readonly loading = signal(true);
  ngOnInit(): void {
    this.store
      .loadClaims()
      .subscribe({ next: () => this.loading.set(false), error: () => this.loading.set(false) });
  }
}

@Component({
  selector: 'app-new-claim-page',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe, SimulationNoticeComponent],
  template: `<section class="page-stack form-page">
    <div class="page-heading">
      <span class="eyebrow">{{ 'claims.new' | transloco }}</span>
      <h1>{{ 'claims.formTitle' | transloco }}</h1>
    </div>
    <form class="panel form-panel" [formGroup]="form" (ngSubmit)="submit()">
      <div class="form-grid">
        <div class="span-two">
          <label for="claim-policy">{{ 'claims.policy' | transloco }}</label
          ><select id="claim-policy" formControlName="policyId">
            @for (policy of store.policies(); track policy.id) {
              <option [value]="policy.id">
                {{ 'products.' + policy.product | transloco }} · {{ policy.id }}
              </option>
            }
          </select>
        </div>
        <div>
          <label for="claim-type">{{ 'claims.type' | transloco }}</label
          ><select id="claim-type" formControlName="type">
            <option value="flightDelay">{{ 'claims.flightDelay' | transloco }}</option>
            <option value="lostBaggage">{{ 'claims.lostBaggage' | transloco }}</option>
            <option value="medicalAssistance">{{ 'claims.medicalAssistance' | transloco }}</option>
          </select>
        </div>
        <div>
          <label for="event-date">{{ 'claims.eventDate' | transloco }}</label
          ><input id="event-date" type="date" formControlName="eventDate" />
        </div>
        <div class="span-two">
          <label for="claim-description">{{ 'claims.description' | transloco }}</label
          ><textarea
            id="claim-description"
            rows="5"
            formControlName="description"
            [placeholder]="'claims.descriptionHint' | transloco"
          ></textarea>
        </div>
        <div class="span-two">
          <label for="claim-location">{{ 'claims.location' | transloco }}</label>
          <div class="input-action">
            <input id="claim-location" formControlName="location" /><button
              class="button secondary compact"
              type="button"
              (click)="demoLocation()"
            >
              {{ 'claims.locationDemo' | transloco }}
            </button>
          </div>
        </div>
        <div class="span-two">
          <label for="evidence">{{ 'claims.evidence' | transloco }}</label
          ><input
            id="evidence"
            type="file"
            multiple
            accept="image/png,image/jpeg,application/pdf"
            (change)="selectEvidence($event)"
          /><small>{{ 'claims.evidenceHint' | transloco }}</small>
          @if (evidenceNames().length) {
            <ul class="file-name-list">
              @for (name of evidenceNames(); track name) {
                <li>{{ name }}</li>
              }
            </ul>
          }
        </div>
      </div>
      @if (form.invalid && form.touched) {
        <div class="form-error-summary" role="alert">{{ 'common.required' | transloco }}</div>
      }
      @if (error()) {
        <div class="inline-alert error" role="alert">{{ 'claims.error' | transloco }}</div>
      }
      <div class="form-actions between">
        <a class="back-link" routerLink="/app/claims">← {{ 'common.back' | transloco }}</a
        ><button class="button conversion" type="submit" [disabled]="loading()">
          {{ (loading() ? 'claims.processing' : 'claims.submit') | transloco }}
        </button>
      </div>
    </form>
    <app-simulation-notice />
  </section>`,
})
export class NewClaimPage implements OnInit {
  readonly store = inject(AppStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly evidenceNames = signal<string[]>([]);
  readonly form = this.fb.nonNullable.group({
    policyId: ['SOL-TRV-2026-1842', Validators.required],
    type: ['flightDelay' as const, Validators.required],
    eventDate: ['2026-09-09', Validators.required],
    description: [
      'Mi vuelo internacional presentó una demora superior a seis horas.',
      [Validators.required, Validators.minLength(20)],
    ],
    location: ['Aeropuerto El Dorado, Bogotá', Validators.required],
  });
  ngOnInit(): void {
    if (!this.store.policies().length) this.store.loadPolicies().subscribe();
  }
  demoLocation(): void {
    this.form.controls.location.setValue('Aeropuerto El Dorado, Bogotá');
  }
  selectEvidence(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? [])
      .slice(0, 5)
      .filter(
        (file) =>
          ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type) &&
          file.size <= 10 * 1024 * 1024,
      );
    this.evidenceNames.set(files.map((file) => file.name));
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    this.store
      .submitClaim({ ...this.form.getRawValue(), evidenceNames: this.evidenceNames() })
      .subscribe({
        next: (claim) =>
          void this.router.navigate(['/app/claims', claim.id], { queryParams: { created: '1' } }),
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }
}

@Component({
  selector: 'app-claim-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    LocalDatePipe,
    LoadingStateComponent,
    SimulationNoticeComponent,
  ],
  template: `<section class="page-stack narrow-content">
    <a class="back-link" routerLink="/app/claims">← {{ 'common.back' | transloco }}</a>
    @if (loading()) {
      <app-loading-state />
    } @else if (!claim()) {
      <div class="empty-state">
        <p>{{ 'claims.notFound' | transloco }}</p>
      </div>
    } @else {
      @if (created) {
        <div class="inline-alert success" role="status">
          ✓ {{ 'claims.successBody' | transloco }}
        </div>
      }
      <div class="detail-hero">
        <div>
          <span class="status" [class]="'status ' + claim()!.status">{{
            'claims.' + claim()!.status | transloco
          }}</span>
          <h1>{{ 'claims.' + claim()!.type | transloco }}</h1>
          <p class="mono">{{ claim()!.id }}</p>
        </div>
        <div>
          <span>{{ 'claims.eventDate' | transloco }}</span
          ><strong>{{ claim()!.eventDate | localDate }}</strong>
        </div>
      </div>
      <div class="detail-grid">
        <section class="panel">
          <h2>{{ 'claims.description' | transloco }}</h2>
          <p>{{ claim()!.description }}</p>
          <h3>{{ 'claims.location' | transloco }}</h3>
          <p>{{ claim()!.location }}</p>
        </section>
        <section class="panel">
          <h2>{{ 'claims.timeline' | transloco }}</h2>
          <ol class="timeline">
            <li class="complete">
              <span></span>
              <div>
                <strong>{{ 'claims.reported' | transloco }}</strong
                ><small>{{ claim()!.eventDate | localDate }}</small>
              </div>
            </li>
            <li [class.complete]="claim()!.status !== 'submitted'">
              <span></span>
              <div>
                <strong>{{ 'claims.reviewing' | transloco }}</strong
                ><small>{{ 'claims.' + claim()!.status | transloco }}</small>
              </div>
            </li>
          </ol>
        </section>
      </div>
      <app-simulation-notice />
    }
  </section>`,
})
export class ClaimDetailPage implements OnInit {
  readonly store = inject(AppStore);
  private route = inject(ActivatedRoute);
  readonly loading = signal(true);
  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly created = this.route.snapshot.queryParamMap.get('created') === '1';
  readonly claim = computed(() =>
    this.store.claims().find((item) => item.id === this.id) ||
    this.store.submittedClaim()?.id === this.id
      ? (this.store.claims().find((item) => item.id === this.id) ?? this.store.submittedClaim())
      : undefined,
  );
  ngOnInit(): void {
    this.store
      .loadClaims()
      .subscribe({ next: () => this.loading.set(false), error: () => this.loading.set(false) });
  }
}
