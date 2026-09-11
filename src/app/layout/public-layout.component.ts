import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, TranslocoPipe],
  template: `
    <a class="skip-link" href="#main-content">{{ 'nav.skip' | transloco }}</a>
    <div class="public-shell">
      <header class="public-header">
        <a class="brand" routerLink="/" aria-label="Solventa home"
          ><span class="brand-mark" aria-hidden="true">S</span
          ><span>{{ 'brand.name' | transloco }}</span></a
        >
        <nav class="header-actions" [attr.aria-label]="'nav.utilityLabel' | transloco">
          <button class="text-button" type="button" (click)="toggleLanguage()">
            {{ languageLabel }}
          </button>
          <a class="button secondary compact" routerLink="/access">{{
            'landing.secondary' | transloco
          }}</a>
        </nav>
      </header>
      <main id="main-content"><router-outlet /></main>
      <footer class="public-footer">
        <span>© 2026 Solventa</span>
        <nav [attr.aria-label]="'nav.legalLabel' | transloco">
          <a routerLink="/legal/terms">{{ 'legal.termsTitle' | transloco }}</a
          ><a routerLink="/legal/privacy">{{ 'legal.privacyTitle' | transloco }}</a
          ><a routerLink="/help">{{ 'nav.help' | transloco }}</a>
        </nav>
      </footer>
    </div>
  `,
})
export class PublicLayoutComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly theme = inject(ThemeService);

  get languageLabel(): string {
    return this.transloco.getActiveLang() === 'en' ? 'ES' : 'EN';
  }

  toggleLanguage(): void {
    const language = this.transloco.getActiveLang() === 'en' ? 'es' : 'en';
    this.transloco.setActiveLang(language);
    localStorage.setItem('solventa.language', language);
    document.documentElement.lang = language;
    void this.theme.preference();
  }
}
