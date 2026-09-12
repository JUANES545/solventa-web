import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore } from '../../core/app-store.service';
import { CopPipe, LocalDatePipe } from '../../shared/format.pipes';
import { ErrorStateComponent, LoadingStateComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    CopPipe,
    LocalDatePipe,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <section class="page-stack">
      <div class="dashboard-heading">
        <div>
          <span class="eyebrow">{{ 'dashboard.summary' | transloco }}</span>
          <h1>{{ 'dashboard.hello' | transloco: { name: store.customer()?.fullName } }}</h1>
          <p>{{ 'dashboard.subtitle' | transloco }}</p>
        </div>
        <div class="button-row">
          <a class="button conversion" routerLink="/app/quote"
            >✈ {{ 'dashboard.newQuote' | transloco }}</a
          ><a class="button secondary" routerLink="/app/claims/new"
            >◇ {{ 'dashboard.reportClaim' | transloco }}</a
          >
        </div>
      </div>
      @if (loading()) {
        <app-loading-state />
      } @else if (error()) {
        <app-error-state (retry)="load()" />
      } @else {
        <div class="metric-grid">
          <article class="metric-card">
            <span>{{ 'dashboard.activePolicies' | transloco }}</span
            ><strong>{{ activePolicies }}</strong
            ><small>{{ 'policies.active' | transloco }}</small>
          </article>
          <article class="metric-card">
            <span>{{ 'nav.notifications' | transloco }}</span
            ><strong>{{ store.unreadNotifications() }}</strong
            ><small>{{ 'notifications.unread' | transloco }}</small>
          </article>
          <article class="metric-card accent">
            <span>{{ 'dashboard.upcomingTrip' | transloco }}</span
            ><strong>Madrid</strong><small>{{ 'dashboard.trip' | transloco }}</small>
          </article>
        </div>
        <div class="dashboard-grid">
          <section class="panel">
            <div class="panel-heading">
              <h2>{{ 'dashboard.activePolicies' | transloco }}</h2>
              <a routerLink="/app/policies">{{ 'nav.policies' | transloco }} →</a>
            </div>
            <div class="compact-list">
              @for (policy of store.policies().slice(0, 3); track policy.id) {
                <a class="compact-item" [routerLink]="['/app/policies', policy.id]"
                  ><span class="item-icon">{{
                    policy.product === 'travel' ? '✈' : policy.product === 'life' ? '♥' : '▣'
                  }}</span
                  ><span
                    ><strong>{{ 'products.' + policy.product | transloco }}</strong
                    ><small>{{ policy.id }} · {{ policy.premiumCop | cop }}</small></span
                  ><span class="status" [class]="'status ' + policy.status">{{
                    'policies.' + policy.status | transloco
                  }}</span></a
                >
              }
            </div>
          </section>
          <section class="panel">
            <div class="panel-heading">
              <h2>{{ 'dashboard.recentNotifications' | transloco }}</h2>
              <a routerLink="/app/notifications">{{ 'nav.notifications' | transloco }} →</a>
            </div>
            <div class="compact-list">
              @for (item of store.notifications().slice(0, 3); track item.id) {
                <div class="compact-item">
                  <span class="unread-dot" [class.hidden]="item.read"></span
                  ><span
                    ><strong>{{ item.titleKey | transloco }}</strong
                    ><small>{{ item.createdAt | localDate }}</small></span
                  >
                </div>
              }
            </div>
          </section>
        </div>
      }
    </section>
  `,
})
export class DashboardPage implements OnInit {
  readonly store = inject(AppStore);
  readonly loading = signal(true);
  readonly error = signal(false);
  private completed = 0;
  get activePolicies(): number {
    return this.store.policies().filter((item) => item.status === 'active').length;
  }
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.completed = 0;
    const done = () => {
      this.completed++;
      if (this.completed === 2) this.loading.set(false);
    };
    const fail = () => {
      this.error.set(true);
      this.loading.set(false);
    };
    this.store.loadPolicies().subscribe({ next: done, error: fail });
    this.store.loadNotifications().subscribe({ next: done, error: fail });
  }
}
