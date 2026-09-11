import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppStore } from '../../core/app-store.service';
import { ThemeService } from '../../core/theme.service';
import { CopPipe, LocalDatePipe } from '../../shared/format.pipes';
import { ErrorStateComponent, LoadingStateComponent } from '../../shared/ui.components';
import { ThemePreference } from '../../models/domain.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payments-page',
  imports: [TranslocoPipe, CopPipe, LocalDatePipe, LoadingStateComponent, ErrorStateComponent],
  template: `<section class="page-stack">
    <div class="page-heading">
      <span class="eyebrow">Solventa</span>
      <h1>{{ 'payments.title' | transloco }}</h1>
      <p>{{ 'payments.subtitle' | transloco }}</p>
    </div>
    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state (retry)="load()" />
    } @else if (!store.payments().length) {
      <div class="empty-state">
        <p>{{ 'payments.empty' | transloco }}</p>
      </div>
    } @else {
      <div class="data-list">
        @for (payment of store.payments(); track payment.id) {
          <article class="data-row">
            <div>
              <strong>{{ payment.id }}</strong
              ><small>{{ payment.createdAt | localDate }} · {{ payment.methodLabel }}</small>
            </div>
            <strong>{{ payment.amountCop | cop }}</strong
            ><span class="status" [class]="'status ' + payment.status">{{
              'payments.' + payment.status | transloco
            }}</span>
          </article>
        }
      </div>
    }
  </section>`,
})
export class PaymentsPage implements OnInit {
  readonly store = inject(AppStore);
  readonly loading = signal(true);
  readonly error = signal(false);
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.store.loadPayments().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}

@Component({
  selector: 'app-notifications-page',
  imports: [TranslocoPipe, LocalDatePipe, LoadingStateComponent],
  template: `<section class="page-stack">
    <div class="page-heading split">
      <div>
        <span class="eyebrow">Solventa</span>
        <h1>{{ 'notifications.title' | transloco }}</h1>
      </div>
      @if (store.notifications().length) {
        <button class="button secondary" type="button" (click)="markAll()">
          {{ 'notifications.markAll' | transloco }}
        </button>
      }
    </div>
    @if (loading()) {
      <app-loading-state />
    } @else if (!store.notifications().length) {
      <div class="empty-state">
        <span aria-hidden="true">✓</span>
        <p>{{ 'notifications.empty' | transloco }}</p>
      </div>
    } @else {
      <div class="notification-list">
        @for (item of store.notifications(); track item.id) {
          <button
            class="notification-row"
            type="button"
            [class.unread]="!item.read"
            (click)="markRead(item.id)"
          >
            <span class="unread-dot" [class.hidden]="item.read"></span
            ><span
              ><strong>{{ item.titleKey | transloco }}</strong
              ><small>{{ item.bodyKey | transloco }}</small></span
            ><time>{{ item.createdAt | localDate }}</time>
          </button>
        }
      </div>
    }
  </section>`,
})
export class NotificationsPage implements OnInit {
  readonly store = inject(AppStore);
  readonly loading = signal(true);
  ngOnInit(): void {
    this.store
      .loadNotifications()
      .subscribe({ next: () => this.loading.set(false), error: () => this.loading.set(false) });
  }
  markRead(id: string): void {
    this.store.markNotificationRead(id).subscribe();
  }
  markAll(): void {
    this.store.markAllNotificationsRead().subscribe();
  }
}

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink, TranslocoPipe],
  template: `<section class="page-stack narrow-content">
    <div class="page-heading">
      <span class="eyebrow">Solventa</span>
      <h1>{{ 'profile.title' | transloco }}</h1>
    </div>
    <article class="profile-card">
      <div class="profile-header">
        <span class="avatar large">VG</span>
        <div>
          <h2>{{ store.customer()?.fullName }}</h2>
          <span class="status active">✓ {{ 'profile.verified' | transloco }}</span>
        </div>
      </div>
      <dl class="profile-details">
        <div>
          <dt>{{ 'profile.name' | transloco }}</dt>
          <dd>{{ store.customer()?.fullName }}</dd>
        </div>
        <div>
          <dt>{{ 'profile.email' | transloco }}</dt>
          <dd>{{ store.customer()?.email }}</dd>
        </div>
        <div>
          <dt>{{ 'profile.document' | transloco }}</dt>
          <dd>•••• {{ store.customer()?.documentNumber?.slice(-4) }}</dd>
        </div>
      </dl>
    </article>
    <div class="button-row">
      <a class="button secondary" routerLink="/app/settings">{{ 'nav.settings' | transloco }}</a
      ><button class="button danger" type="button" (click)="logout()">
        {{ 'common.logout' | transloco }}
      </button>
    </div>
  </section>`,
})
export class ProfilePage {
  readonly store = inject(AppStore);
  private router = inject(Router);
  logout(): void {
    this.store.logout();
    void this.router.navigate(['/']);
  }
}

@Component({
  selector: 'app-settings-page',
  imports: [TranslocoPipe, RouterLink],
  template: `<section class="page-stack narrow-content">
    <div class="page-heading">
      <span class="eyebrow">Solventa</span>
      <h1>{{ 'settings.title' | transloco }}</h1>
      <p>{{ 'settings.saved' | transloco }}</p>
    </div>
    <section class="panel">
      <h2>{{ 'settings.language' | transloco }}</h2>
      <div class="segmented" role="radiogroup" [attr.aria-label]="'settings.language' | transloco">
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="lang === 'es'"
          [class.active]="lang === 'es'"
          (click)="setLanguage('es')"
        >
          {{ 'settings.spanish' | transloco }}</button
        ><button
          type="button"
          role="radio"
          [attr.aria-checked]="lang === 'en'"
          [class.active]="lang === 'en'"
          (click)="setLanguage('en')"
        >
          {{ 'settings.english' | transloco }}
        </button>
      </div>
    </section>
    <section class="panel">
      <h2>{{ 'settings.appearance' | transloco }}</h2>
      <div
        class="segmented"
        role="radiogroup"
        [attr.aria-label]="'settings.appearance' | transloco"
      >
        @for (option of themes; track option) {
          <button
            type="button"
            role="radio"
            [attr.aria-checked]="theme.preference() === option"
            [class.active]="theme.preference() === option"
            (click)="theme.set(option)"
          >
            {{ 'settings.' + option | transloco }}
          </button>
        }
      </div>
    </section>
    @if (isDevelopment) {
      <a class="button secondary" routerLink="/app/__dev/scenarios">{{
        'scenarios.title' | transloco
      }}</a>
    }
  </section>`,
})
export class SettingsPage {
  readonly theme = inject(ThemeService);
  private transloco = inject(TranslocoService);
  readonly themes: ThemePreference[] = ['system', 'light', 'dark'];
  readonly isDevelopment = !environment.production;
  get lang(): string {
    return this.transloco.getActiveLang();
  }
  setLanguage(lang: 'es' | 'en'): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem('solventa.language', lang);
    document.documentElement.lang = lang;
  }
}
