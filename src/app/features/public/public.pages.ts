import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SimulationNoticeComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, TranslocoPipe, SimulationNoticeComponent],
  template: `
    <section class="hero page-section">
      <div class="hero-copy">
        <span class="eyebrow">{{ 'landing.eyebrow' | transloco }}</span>
        <h1>{{ 'landing.title' | transloco }}</h1>
        <p class="lead">{{ 'landing.body' | transloco }}</p>
        <div class="button-row">
          <a class="button primary" routerLink="/register">{{ 'landing.primary' | transloco }}</a
          ><a class="button secondary" routerLink="/access">{{
            'landing.secondary' | transloco
          }}</a>
        </div>
        <app-simulation-notice />
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="visual-card visual-card-main">
          <span class="mini-label">SOL-TRV-2026-1842</span
          ><strong>{{ 'products.travel' | transloco }}</strong
          ><span class="status success">✓ {{ 'policies.active' | transloco }}</span>
          <div class="visual-line"></div>
          <div class="visual-line short"></div>
        </div>
        <div class="visual-card visual-card-float">
          <span>✈</span><strong>COP 139.900</strong><small>Plus</small>
        </div>
      </div>
    </section>
    <section class="page-section section-stack" aria-labelledby="products-title">
      <div>
        <span class="eyebrow">Solventa</span>
        <h2 id="products-title">{{ 'landing.productsTitle' | transloco }}</h2>
      </div>
      <div class="card-grid three">
        <article class="feature-card">
          <span class="feature-icon" aria-hidden="true">✈</span>
          <h3>{{ 'landing.travel' | transloco }}</h3>
          <p>{{ 'landing.travelBody' | transloco }}</p>
        </article>
        <article class="feature-card">
          <span class="feature-icon" aria-hidden="true">♥</span>
          <h3>{{ 'landing.life' | transloco }}</h3>
          <p>{{ 'landing.lifeBody' | transloco }}</p>
        </article>
        <article class="feature-card">
          <span class="feature-icon" aria-hidden="true">▣</span>
          <h3>{{ 'landing.device' | transloco }}</h3>
          <p>{{ 'landing.deviceBody' | transloco }}</p>
        </article>
      </div>
    </section>
    <section class="trust-section">
      <div>
        <h2>{{ 'landing.trustTitle' | transloco }}</h2>
        <p>{{ 'landing.trustBody' | transloco }}</p>
      </div>
      <a class="button conversion" routerLink="/register">{{ 'landing.primary' | transloco }}</a>
    </section>
  `,
})
export class LandingPage {}

@Component({
  selector: 'app-help-page',
  imports: [TranslocoPipe],
  template: `<section class="narrow-page">
    <div class="page-heading">
      <span class="eyebrow">Solventa</span>
      <h1>{{ 'help.title' | transloco }}</h1>
      <p>{{ 'help.subtitle' | transloco }}</p>
    </div>
    <div class="faq-list">
      <details open>
        <summary>{{ 'help.quoteQ' | transloco }}</summary>
        <p>{{ 'help.quoteA' | transloco }}</p>
      </details>
      <details>
        <summary>{{ 'help.paymentQ' | transloco }}</summary>
        <p>{{ 'help.paymentA' | transloco }}</p>
      </details>
      <details>
        <summary>{{ 'help.claimQ' | transloco }}</summary>
        <p>{{ 'help.claimA' | transloco }}</p>
      </details>
    </div>
  </section>`,
})
export class HelpPage {}

@Component({
  selector: 'app-legal-page',
  imports: [TranslocoPipe],
  template: `<article class="narrow-page legal-page">
    <span class="eyebrow">Solventa</span>
    <h1>{{ titleKey | transloco }}</h1>
    <div class="inline-alert warning" role="note">{{ 'legal.prototype' | transloco }}</div>
    <p>{{ 'legal.body' | transloco }}</p>
  </article>`,
})
export class LegalPage {
  titleKey = location.pathname.endsWith('privacy') ? 'legal.privacyTitle' : 'legal.termsTitle';
}

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslocoPipe],
  template: `<section class="state-page">
    <div class="state-code">404</div>
    <h1>{{ 'errors.notFoundTitle' | transloco }}</h1>
    <p>{{ 'errors.notFoundBody' | transloco }}</p>
    <a class="button primary" routerLink="/">{{ 'errors.home' | transloco }}</a>
  </section>`,
})
export class NotFoundPage {}
