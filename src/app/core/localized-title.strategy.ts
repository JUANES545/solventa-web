import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { take } from 'rxjs';

@Injectable()
export class LocalizedTitleStrategy extends TitleStrategy {
  private readonly documentTitle = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private currentTitle = 'Solventa';

  private readonly keys: Record<string, string> = {
    Solventa: 'brand.name',
    'Solventa · Access': 'auth.title',
    'Solventa · Password recovery': 'auth.resetTitle',
    'Solventa · Register': 'register.title',
    'Solventa · Consents': 'register.consentTitle',
    'Solventa · Identity verification': 'kyc.title',
    'Solventa · Help': 'help.title',
    'Solventa · Terms': 'legal.termsTitle',
    'Solventa · Privacy': 'legal.privacyTitle',
    'Solventa · Dashboard': 'nav.dashboard',
    'Solventa · Travel quote': 'quote.title',
    'Solventa · Plans': 'plans.title',
    'Solventa · Checkout': 'checkout.title',
    'Solventa · Payment': 'payment.title',
    'Solventa · OTP': 'otp.title',
    'Solventa · Issued policy': 'issued.title',
    'Solventa · Policies': 'policies.title',
    'Solventa · Policy': 'policies.title',
    'Solventa · Claims': 'claims.title',
    'Solventa · New claim': 'claims.formTitle',
    'Solventa · Claim': 'claims.title',
    'Solventa · Payments': 'payments.title',
    'Solventa · Notifications': 'notifications.title',
    'Solventa · Profile': 'profile.title',
    'Solventa · Settings': 'settings.title',
    'Solventa · Test scenarios': 'scenarios.title',
    'Solventa · Not found': 'errors.notFoundTitle',
  };

  constructor() {
    super();
    this.transloco.langChanges$.subscribe(() => this.applyTitle());
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.currentTitle = this.buildTitle(snapshot) ?? 'Solventa';
    this.applyTitle();
  }

  private applyTitle(): void {
    const key = this.keys[this.currentTitle] ?? 'brand.name';
    this.transloco
      .selectTranslate(key)
      .pipe(take(1))
      .subscribe((translated) => {
        this.documentTitle.setTitle(key === 'brand.name' ? translated : `${translated} · Solventa`);
      });
  }
}
