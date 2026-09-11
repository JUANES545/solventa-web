import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppStore } from '../core/app-store.service';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe],
  template: `
    <a class="skip-link" href="#main-content">{{ 'nav.skip' | transloco }}</a>
    <div class="app-shell">
      <aside class="sidebar" [class.open]="menuOpen()">
        <div class="sidebar-header">
          <a class="brand brand-light" routerLink="/app/dashboard" (click)="closeMenu()"
            ><span class="brand-mark" aria-hidden="true">S</span
            ><span>{{ 'brand.name' | transloco }}</span></a
          >
          <button
            class="icon-button mobile-only"
            type="button"
            (click)="closeMenu()"
            [attr.aria-label]="'nav.close' | transloco"
          >
            ×
          </button>
        </div>
        <nav class="main-nav" [attr.aria-label]="'nav.mainLabel' | transloco">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" (click)="closeMenu()"
              ><span aria-hidden="true">{{ item.icon }}</span
              ><span>{{ item.label | transloco }}</span>
              @if (item.badge && store.unreadNotifications()) {
                <span class="nav-badge">{{ store.unreadNotifications() }}</span>
              }
            </a>
          }
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/app/settings" routerLinkActive="active" (click)="closeMenu()"
            >⚙ <span>{{ 'nav.settings' | transloco }}</span></a
          >
          <a routerLink="/app/help" routerLinkActive="active" (click)="closeMenu()"
            >? <span>{{ 'nav.help' | transloco }}</span></a
          >
        </div>
      </aside>
      @if (menuOpen()) {
        <button
          class="scrim"
          type="button"
          (click)="closeMenu()"
          [attr.aria-label]="'nav.close' | transloco"
        ></button>
      }
      <div class="app-main">
        <header class="app-header">
          <button
            class="icon-button mobile-only"
            type="button"
            (click)="menuOpen.set(true)"
            [attr.aria-label]="'nav.menu' | transloco"
          >
            ☰
          </button>
          <div class="header-spacer"></div>
          <button class="text-button" type="button" (click)="toggleLanguage()">
            {{ languageLabel }}
          </button>
          <a
            class="notification-button"
            routerLink="/app/notifications"
            [attr.aria-label]="'nav.notifications' | transloco"
            >♢
            @if (store.unreadNotifications()) {
              <span>{{ store.unreadNotifications() }}</span>
            }
          </a>
          <div class="user-chip">
            <span class="avatar" aria-hidden="true">VG</span
            ><span>{{ store.customer()?.fullName }}</span>
          </div>
        </header>
        <main id="main-content" class="content"><router-outlet /></main>
      </div>
    </div>
  `,
})
export class AppShellComponent {
  readonly store = inject(AppStore);
  readonly menuOpen = signal(false);
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  readonly navItems = [
    { route: '/app/dashboard', label: 'nav.dashboard', icon: '⌂' },
    { route: '/app/quote', label: 'nav.quote', icon: '✈' },
    { route: '/app/policies', label: 'nav.policies', icon: '▣' },
    { route: '/app/claims', label: 'nav.claims', icon: '◇' },
    { route: '/app/payments', label: 'nav.payments', icon: '$' },
    { route: '/app/notifications', label: 'nav.notifications', icon: '♢', badge: true },
    { route: '/app/profile', label: 'nav.profile', icon: '○' },
  ];

  constructor() {
    void this.theme.preference();
    this.store.loadNotifications().subscribe({ error: () => undefined });
  }

  get languageLabel(): string {
    return this.transloco.getActiveLang() === 'en' ? 'ES' : 'EN';
  }
  closeMenu(): void {
    this.menuOpen.set(false);
  }
  toggleLanguage(): void {
    const language = this.transloco.getActiveLang() === 'en' ? 'es' : 'en';
    this.transloco.setActiveLang(language);
    localStorage.setItem('solventa.language', language);
    document.documentElement.lang = language;
  }
  logout(): void {
    this.store.logout();
    void this.router.navigate(['/']);
  }
}
