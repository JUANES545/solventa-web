import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withHashLocation } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { SolventaTranslocoLoader } from './core/transloco-loader';
import { LocalizedTitleStrategy } from './core/localized-title.strategy';
import {
  MockAuthenticationRepository,
  MockClaimRepository,
  MockConsentRepository,
  MockCustomerRepository,
  MockNotificationRepository,
  MockPaymentRepository,
  MockPolicyRepository,
  MockQuoteRepository,
} from './data-access/mock/mock.repositories';
import {
  AUTHENTICATION_REPOSITORY,
  CLAIM_REPOSITORY,
  CONSENT_REPOSITORY,
  CUSTOMER_REPOSITORY,
  NOTIFICATION_REPOSITORY,
  PAYMENT_REPOSITORY,
  POLICY_REPOSITORY,
  QUOTE_REPOSITORY,
} from './data-access/repository.tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: TitleStrategy, useClass: LocalizedTitleStrategy },
    provideTransloco({
      config: {
        availableLangs: ['es', 'en'],
        defaultLang: localStorage.getItem('solventa.language') ?? 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: SolventaTranslocoLoader,
    }),
    { provide: AUTHENTICATION_REPOSITORY, useClass: MockAuthenticationRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: MockCustomerRepository },
    { provide: CONSENT_REPOSITORY, useClass: MockConsentRepository },
    { provide: QUOTE_REPOSITORY, useClass: MockQuoteRepository },
    { provide: POLICY_REPOSITORY, useClass: MockPolicyRepository },
    { provide: CLAIM_REPOSITORY, useClass: MockClaimRepository },
    { provide: PAYMENT_REPOSITORY, useClass: MockPaymentRepository },
    { provide: NOTIFICATION_REPOSITORY, useClass: MockNotificationRepository },
  ],
};
