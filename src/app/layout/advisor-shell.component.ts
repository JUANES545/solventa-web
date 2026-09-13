import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AdvisorFacade } from '../core/advisor.facade';
import { AppStore } from '../core/app-store.service';
import { IconName, SvgIconComponent } from '../shared/svg-icon.component';

@Component({
  selector: 'app-advisor-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe, SvgIconComponent],
  template: `
    <a class="skip-link" href="#main-content">{{ 'nav.skip' | transloco }}</a>
    <div class="app-shell advisor-shell">
      <aside class="sidebar advisor-sidebar" [class.open]="menuOpen()">
        <div class="sidebar-header">
          <a class="brand brand-light" routerLink="/advisor/dashboard" (click)="closeMenu()"
            ><span class="brand-mark" aria-hidden="true">S</span
            ><span>{{ 'brand.name' | transloco }}</span></a
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
        <span class="advisor-role-label">{{ 'advisor.role' | transloco }}</span>
        <nav class="main-nav" [attr.aria-label]="'nav.mainLabel' | transloco">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" (click)="closeMenu()"
              ><span class="nav-icon"><app-icon [name]="item.icon" [size]="20" /></span
              ><span>{{ item.label | transloco }}</span></a
            >
          }
        </nav>
        <div class="sidebar-footer">
          <button class="sidebar-action" type="button" (click)="logout()">
            <span class="nav-icon"><app-icon name="arrow-left" [size]="20" /></span
            ><span>{{ 'common.logout' | transloco }}</span>
          </button>
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
          <div class="user-chip">
            <span class="avatar" aria-hidden="true">{{ advisorInitials }}</span
            ><span>{{ store.advisor()?.fullName }}</span>
          </div>
        </header>
        @if (facade.selectedCustomer(); as customer) {
          <div class="advisor-context-bar" role="status">
            <span
              ><small>{{ 'advisor.context.attending' | transloco }}</small
              ><strong>{{ customer.fullName }}</strong></span
            >
            <div>
              <a [routerLink]="['/advisor/clients', customer.id]">{{
                'advisor.context.view' | transloco
              }}</a>
              <a class="button compact primary" routerLink="/advisor/quote">{{
                'advisor.quote.start' | transloco
              }}</a>
              <button
                class="icon-button"
                type="button"
                (click)="closeContext()"
                [attr.aria-label]="'advisor.context.close' | transloco"
              >
                <app-icon name="close" [size]="19" />
              </button>
            </div>
          </div>
        }
        <main id="main-content" class="content"><router-outlet /></main>
      </div>
    </div>
  `,
})
export class AdvisorShellComponent {
  readonly store = inject(AppStore);
  readonly facade = inject(AdvisorFacade);
  readonly menuOpen = signal(false);
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  readonly navItems: Array<{ route: string; label: string; icon: IconName }> = [
    { route: '/advisor/dashboard', label: 'nav.dashboard', icon: 'home' },
    { route: '/advisor/clients', label: 'advisor.nav.clients', icon: 'user' },
    { route: '/advisor/quotes', label: 'advisor.nav.quotes', icon: 'file' },
  ];

  get languageLabel(): string {
    return this.transloco.getActiveLang() === 'en' ? 'ES' : 'EN';
  }

  get advisorInitials(): string {
    return (this.store.advisor()?.fullName ?? 'A')
      .split(' ')
      .slice(0, 2)
      .map((part: string) => part[0])
      .join('');
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

  closeContext(): void {
    this.facade.closeCustomerContext();
    void this.router.navigate(['/advisor/clients']);
  }

  logout(): void {
    this.facade.closeCustomerContext();
    this.store.logout();
    void this.router.navigate(['/']);
  }
}
