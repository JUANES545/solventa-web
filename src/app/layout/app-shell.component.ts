import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AppStore } from '../core/app-store.service';
import { ThemeService } from '../core/theme.service';
import { IconName, SvgIconComponent } from '../shared/svg-icon.component';
import { BrandMarkComponent } from '../shared/brand-mark.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslocoPipe,
    SvgIconComponent,
    BrandMarkComponent,
  ],
  template: `
    <a class="skip-link" href="#main-content">{{ 'nav.skip' | transloco }}</a>
    <div class="app-shell">
      <aside class="sidebar" [class.open]="menuOpen()">
        <div class="sidebar-header">
          <a class="brand brand-light" routerLink="/app/dashboard" (click)="closeMenu()"
            ><app-brand-mark /><span>{{ 'brand.name' | transloco }}</span></a
          >
          <button
            class="icon-button mobile-only"
            type="button"
            (click)="closeMenu()"
            [attr.aria-label]="'nav.close' | transloco"
          >
            <app-icon name="close" [size]="22" />
          </button>
        </div>
        <nav class="main-nav" [attr.aria-label]="'nav.mainLabel' | transloco">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" (click)="closeMenu()"
              ><span class="nav-icon"><app-icon [name]="item.icon" [size]="20" /></span
              ><span>{{ item.label | transloco }}</span>
              @if (item.badge && store.unreadNotifications()) {
                <span class="nav-badge">{{ store.unreadNotifications() }}</span>
              }
            </a>
          }
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/app/settings" routerLinkActive="active" (click)="closeMenu()"
            ><span class="nav-icon"><app-icon name="settings" [size]="20" /></span
            ><span>{{ 'nav.settings' | transloco }}</span></a
          >
          <a routerLink="/app/help" routerLinkActive="active" (click)="closeMenu()"
            ><span class="nav-icon"><app-icon name="help" [size]="20" /></span
            ><span>{{ 'nav.help' | transloco }}</span></a
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
            <app-icon name="menu" [size]="23" />
          </button>
          <div class="header-spacer"></div>
          <button class="text-button" type="button" (click)="toggleLanguage()">
            {{ languageLabel }}
          </button>
          <a
            class="notification-button"
            routerLink="/app/notifications"
            [attr.aria-label]="'nav.notifications' | transloco"
            ><app-icon name="bell" [size]="21" />
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
  readonly navItems: Array<{ route: string; label: string; icon: IconName; badge?: boolean }> = [
    { route: '/app/dashboard', label: 'nav.dashboard', icon: 'home' },
    { route: '/app/quote', label: 'nav.quote', icon: 'plane' },
    { route: '/app/policies', label: 'nav.policies', icon: 'policy' },
    { route: '/app/claims', label: 'nav.claims', icon: 'claim' },
    { route: '/app/payments', label: 'nav.payments', icon: 'payment' },
    { route: '/app/notifications', label: 'nav.notifications', icon: 'bell', badge: true },
    { route: '/app/profile', label: 'nav.profile', icon: 'user' },
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
