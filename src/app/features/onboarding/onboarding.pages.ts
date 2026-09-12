import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore } from '../../core/app-store.service';

@Component({
  selector: 'app-consent-page',
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
  template: `<section class="auth-page">
    <div class="auth-panel wide">
      <a class="back-link" routerLink="/register">← {{ 'common.back' | transloco }}</a>
      <div class="step-label">1 / 2</div>
      <h1>{{ 'register.consentTitle' | transloco }}</h1>
      <p>{{ 'register.consentBody' | transloco }}</p>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label class="choice-row"
          ><input type="checkbox" formControlName="termsAccepted" /><span>{{
            'register.terms' | transloco
          }}</span></label
        ><label class="choice-row"
          ><input type="checkbox" formControlName="privacyAccepted" /><span>{{
            'register.privacy' | transloco
          }}</span></label
        ><label class="choice-row optional"
          ><input type="checkbox" formControlName="openFinanceAuthorized" /><span>{{
            'register.openFinance' | transloco
          }}</span></label
        >
        @if (error()) {
          <div class="inline-alert error" role="alert">
            {{ 'register.requiredConsent' | transloco }}
          </div>
        }
        <button class="button primary full" type="submit" [disabled]="loading()">
          {{ (loading() ? 'common.loading' : 'common.continue') | transloco }}
        </button>
      </form>
    </div>
  </section>`,
})
export class ConsentPage {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  readonly error = signal(false);
  readonly loading = signal(false);
  readonly form = this.fb.nonNullable.group({
    termsAccepted: [false],
    privacyAccepted: [false],
    openFinanceAuthorized: [true],
  });
  submit(): void {
    const value = this.form.getRawValue();
    if (!value.termsAccepted || !value.privacyAccepted) {
      this.error.set(true);
      return;
    }
    this.loading.set(true);
    this.store.saveConsent(value).subscribe({
      next: () => void this.router.navigate(['/kyc']),
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}

@Component({
  selector: 'app-kyc-page',
  imports: [TranslocoPipe, RouterLink],
  template: `<section class="auth-page">
    <div class="auth-panel wide">
      <a class="back-link" routerLink="/consent">← {{ 'common.back' | transloco }}</a>
      <div class="step-label">2 / 2</div>
      @if (approved()) {
        <div class="success-illustration" aria-hidden="true">✓</div>
        <h1>{{ 'kyc.approvedTitle' | transloco }}</h1>
        <p>{{ 'kyc.approvedBody' | transloco }}</p>
        <button class="button primary full" type="button" (click)="finish()">
          {{ 'common.continue' | transloco }}
        </button>
      } @else {
        <h1>{{ 'kyc.title' | transloco }}</h1>
        <p>{{ 'kyc.body' | transloco }}</p>
        <div class="file-grid">
          <label class="file-picker"
            ><span>▤</span><strong>{{ 'kyc.document' | transloco }}</strong
            ><input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              (change)="selectFile($event, 'document')"
            />
            @if (documentName()) {
              <small>{{ 'kyc.selected' | transloco }}: {{ documentName() }}</small>
            }</label
          ><label class="file-picker"
            ><span>◉</span><strong>{{ 'kyc.selfie' | transloco }}</strong
            ><input
              type="file"
              accept="image/png,image/jpeg"
              capture="user"
              (change)="selectFile($event, 'selfie')"
            />
            @if (selfieName()) {
              <small>{{ 'kyc.selected' | transloco }}: {{ selfieName() }}</small>
            }
          </label>
        </div>
        <button
          class="button primary full"
          type="button"
          (click)="verify()"
          [disabled]="!documentName() || !selfieName() || loading()"
        >
          {{ (loading() ? 'kyc.processing' : 'kyc.action') | transloco }}
        </button>
      }
    </div>
  </section>`,
})
export class KycPage {
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  readonly documentName = signal('documento-demo.pdf');
  readonly selfieName = signal('selfie-demo.jpg');
  readonly loading = signal(false);
  readonly approved = signal(false);
  selectFile(event: Event, type: 'document' | 'selfie'): void {
    const input = event.target as HTMLInputElement;
    const name = input.files?.[0]?.name ?? '';
    if (type === 'document') this.documentName.set(name);
    else this.selfieName.set(name);
  }
  verify(): void {
    this.loading.set(true);
    this.store.completeKyc().subscribe({
      next: () => {
        this.loading.set(false);
        this.approved.set(true);
      },
      error: () => this.loading.set(false),
    });
  }
  finish(): void {
    void this.router.navigate(['/app/dashboard']);
  }
}
