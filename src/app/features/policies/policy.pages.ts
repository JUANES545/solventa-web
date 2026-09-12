import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore } from '../../core/app-store.service';
import { CopPipe, LocalDatePipe } from '../../shared/format.pipes';
import { IconName, SvgIconComponent } from '../../shared/svg-icon.component';
import { ErrorStateComponent, LoadingStateComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-policies-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    CopPipe,
    LocalDatePipe,
    LoadingStateComponent,
    ErrorStateComponent,
    SvgIconComponent,
  ],
  template: `<section class="page-stack">
    <div class="page-heading split">
      <div>
        <span class="eyebrow">Solventa</span>
        <h1>{{ 'policies.title' | transloco }}</h1>
        <p>{{ 'policies.subtitle' | transloco }}</p>
      </div>
      <a class="button primary" routerLink="/app/quote">{{ 'dashboard.newQuote' | transloco }}</a>
    </div>
    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state (retry)="load()" />
    } @else if (!store.policies().length) {
      <div class="empty-state">
        <span><app-icon name="policy" [size]="30" /></span>
        <p>{{ 'policies.empty' | transloco }}</p>
        <a class="button primary" routerLink="/app/quote">{{ 'dashboard.newQuote' | transloco }}</a>
      </div>
    } @else {
      <div class="card-grid two">
        @for (policy of store.policies(); track policy.id) {
          <article class="entity-card">
            <div class="entity-card-header">
              <span class="product-icon"
                ><app-icon [name]="productIcons[policy.product]" [size]="21" /></span
              ><span class="status" [class]="'status ' + policy.status">{{
                'policies.' + policy.status | transloco
              }}</span>
            </div>
            <h2>{{ 'products.' + policy.product | transloco }}</h2>
            <p class="mono">{{ policy.id }}</p>
            <dl class="inline-details">
              <div>
                <dt>{{ 'policies.premium' | transloco }}</dt>
                <dd>{{ policy.premiumCop | cop }}</dd>
              </div>
              <div>
                <dt>{{ 'policies.validity' | transloco }}</dt>
                <dd>{{ policy.validUntil | localDate }}</dd>
              </div>
            </dl>
            <a class="button secondary full" [routerLink]="['/app/policies', policy.id]"
              >{{ 'common.view' | transloco }}<app-icon name="arrow-right" [size]="17"
            /></a>
          </article>
        }
      </div>
    }
  </section>`,
})
export class PoliciesPage implements OnInit {
  readonly store = inject(AppStore);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly productIcons: Record<'travel' | 'life' | 'device' | 'parametric', IconName> = {
    travel: 'plane',
    life: 'heart',
    device: 'device',
    parametric: 'shield',
  };
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.store.loadPolicies().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}

@Component({
  selector: 'app-policy-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    CopPipe,
    LocalDatePipe,
    LoadingStateComponent,
    SvgIconComponent,
  ],
  template: `<section class="page-stack narrow-content">
    <a class="back-link" routerLink="/app/policies"
      ><app-icon name="arrow-left" [size]="17" />{{ 'common.back' | transloco }}</a
    >
    @if (loading()) {
      <app-loading-state />
    } @else if (!policy()) {
      <div class="empty-state">
        <p>{{ 'policies.notFound' | transloco }}</p>
      </div>
    } @else {
      <div class="detail-hero">
        <div>
          <span class="status" [class]="'status ' + policy()!.status">{{
            'policies.' + policy()!.status | transloco
          }}</span>
          <h1>{{ 'products.' + policy()!.product | transloco }}</h1>
          <p class="mono">{{ policy()!.id }}</p>
        </div>
        <div class="premium-block">
          <span>{{ 'policies.premium' | transloco }}</span
          ><strong>{{ policy()!.premiumCop | cop }}</strong>
        </div>
      </div>
      <div class="detail-grid">
        <section class="panel">
          <h2>{{ 'policies.coverage' | transloco }}</h2>
          <ul class="coverage-list">
            @for (key of policy()!.coverageKeys; track key) {
              <li><app-icon name="check" [size]="18" />{{ 'coverage.' + key | transloco }}</li>
            }
          </ul>
        </section>
        <section class="panel">
          <h2>{{ 'policies.validity' | transloco }}</h2>
          <p>{{ policy()!.validFrom | localDate }} — {{ policy()!.validUntil | localDate }}</p>
          <button class="button secondary full" type="button" (click)="download()">
            <app-icon name="file" [size]="18" />{{ 'policies.download' | transloco }}
          </button>
          @if (downloaded()) {
            <p class="success-text" role="status">{{ 'policies.downloaded' | transloco }}</p>
          }
        </section>
      </div>
      @if (policy()!.product === 'travel') {
        <a class="button conversion" routerLink="/app/claims/new"
          ><app-icon name="claim" [size]="18" />{{ 'policies.newClaim' | transloco }}</a
        >
      }
    }
  </section>`,
})
export class PolicyDetailPage implements OnInit {
  readonly store = inject(AppStore);
  private route = inject(ActivatedRoute);
  readonly loading = signal(true);
  readonly downloaded = signal(false);
  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly policy = computed(() => this.store.policies().find((item) => item.id === this.id));
  ngOnInit(): void {
    this.store
      .loadPolicies()
      .subscribe({ next: () => this.loading.set(false), error: () => this.loading.set(false) });
  }
  download(): void {
    const content = `Solventa demonstration policy\n${this.id}\nNot a contractual document.`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.id}-demo.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.downloaded.set(true);
  }
}
