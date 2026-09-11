import { InjectionToken } from '@angular/core';
import {
  AuthenticationRepository,
  ClaimRepository,
  ConsentRepository,
  CustomerRepository,
  NotificationRepository,
  PaymentRepository,
  PolicyRepository,
  QuoteRepository,
} from './repository.contracts';

export const AUTHENTICATION_REPOSITORY = new InjectionToken<AuthenticationRepository>(
  'AUTHENTICATION_REPOSITORY',
);
export const CUSTOMER_REPOSITORY = new InjectionToken<CustomerRepository>('CUSTOMER_REPOSITORY');
export const CONSENT_REPOSITORY = new InjectionToken<ConsentRepository>('CONSENT_REPOSITORY');
export const QUOTE_REPOSITORY = new InjectionToken<QuoteRepository>('QUOTE_REPOSITORY');
export const POLICY_REPOSITORY = new InjectionToken<PolicyRepository>('POLICY_REPOSITORY');
export const CLAIM_REPOSITORY = new InjectionToken<ClaimRepository>('CLAIM_REPOSITORY');
export const PAYMENT_REPOSITORY = new InjectionToken<PaymentRepository>('PAYMENT_REPOSITORY');
export const NOTIFICATION_REPOSITORY = new InjectionToken<NotificationRepository>(
  'NOTIFICATION_REPOSITORY',
);
