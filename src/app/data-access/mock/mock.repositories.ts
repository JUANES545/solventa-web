import { Injectable, inject, signal } from '@angular/core';
import { Observable, delay, of, switchMap, throwError } from 'rxjs';
import {
  AuthenticationRepository,
  ClaimRepository,
  ConsentRepository,
  CustomerRepository,
  NotificationRepository,
  PaymentRepository,
  PolicyRepository,
  QuoteRepository,
} from '../repository.contracts';
import {
  Claim,
  ClaimDraft,
  ConsentRecord,
  Customer,
  Payment,
  Policy,
  SolventaNotification,
  TravelDetails,
  TravelPlan,
} from '../../models/domain.models';
import { TestScenarioService } from '../../testing/test-scenario.service';

export class SimulatedNetworkError extends Error {}
export class InvalidCredentialsError extends Error {}
export class PaymentRejectedError extends Error {}
export class QuoteUnavailableError extends Error {}
export class ClaimSubmissionError extends Error {}

export const DEMO_CUSTOMER: Customer = {
  id: 'customer-demo',
  fullName: 'Valentina Gómez',
  email: 'demo@solventa.co',
  documentNumber: '1020304050',
  kycStatus: 'approved',
};

const PLANS: TravelPlan[] = [
  {
    id: 'essential',
    priceCop: 89900,
    medicalCoverageCop: 80000000,
    baggageCoverageCop: 2000000,
    delayCoverageCop: 500000,
  },
  {
    id: 'plus',
    priceCop: 139900,
    medicalCoverageCop: 150000000,
    baggageCoverageCop: 4000000,
    delayCoverageCop: 1000000,
    recommended: true,
  },
  {
    id: 'premium',
    priceCop: 219900,
    medicalCoverageCop: 300000000,
    baggageCoverageCop: 8000000,
    delayCoverageCop: 2000000,
  },
];

const INITIAL_POLICIES: Policy[] = [
  {
    id: 'SOL-TRV-2026-1842',
    product: 'travel',
    name: 'International Travel',
    status: 'active',
    premiumCop: 139900,
    validFrom: '2026-10-04',
    validUntil: '2026-10-19',
    coverageKeys: ['medical', 'baggage', 'delay'],
  },
  {
    id: 'SOL-LIF-2026-0714',
    product: 'life',
    name: 'Protected Life',
    status: 'active',
    premiumCop: 64500,
    validFrom: '2026-01-01',
    validUntil: '2027-01-01',
    coverageKeys: ['life', 'disability'],
  },
  {
    id: 'SOL-DEV-2025-0280',
    product: 'device',
    name: 'Protected Device',
    status: 'expiring',
    premiumCop: 22900,
    validFrom: '2025-10-01',
    validUntil: '2026-10-01',
    coverageKeys: ['damage', 'theft'],
  },
  {
    id: 'SOL-PAR-2025-0131',
    product: 'parametric',
    name: 'Climate Protection',
    status: 'expired',
    premiumCop: 31000,
    validFrom: '2025-01-01',
    validUntil: '2026-01-01',
    coverageKeys: ['rainfall'],
  },
];

const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'SIN-2026-0942',
    policyId: 'SOL-TRV-2026-1842',
    type: 'flightDelay',
    status: 'inReview',
    eventDate: '2026-08-18',
    description: 'Flight delay during international travel.',
    location: 'Madrid-Barajas Airport',
  },
  {
    id: 'SIN-2026-0811',
    policyId: 'SOL-TRV-2026-1842',
    type: 'lostBaggage',
    status: 'approved',
    eventDate: '2026-05-12',
    description: 'Baggage did not arrive at the destination.',
    location: 'El Dorado Airport, Bogotá',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'PAY-2026-3401',
    policyId: 'SOL-TRV-2026-1842',
    amountCop: 139900,
    methodLabel: '•••• 4821',
    status: 'approved',
    createdAt: '2026-09-05',
  },
  {
    id: 'PAY-2026-3378',
    amountCop: 64500,
    methodLabel: '•••• 4821',
    status: 'pending',
    createdAt: '2026-09-01',
  },
  {
    id: 'PAY-2026-3302',
    amountCop: 22900,
    methodLabel: '•••• 4821',
    status: 'rejected',
    createdAt: '2026-08-22',
  },
];

const INITIAL_NOTIFICATIONS: SolventaNotification[] = [
  {
    id: 'NOT-1',
    type: 'claim',
    titleKey: 'notifications.claimTitle',
    bodyKey: 'notifications.claimBody',
    createdAt: '2026-09-08',
    read: false,
  },
  {
    id: 'NOT-2',
    type: 'payment',
    titleKey: 'notifications.paymentTitle',
    bodyKey: 'notifications.paymentBody',
    createdAt: '2026-09-05',
    read: false,
  },
  {
    id: 'NOT-3',
    type: 'expiration',
    titleKey: 'notifications.expirationTitle',
    bodyKey: 'notifications.expirationBody',
    createdAt: '2026-09-01',
    read: true,
  },
];

abstract class MockRepositoryBase {
  protected readonly scenarios = inject(TestScenarioService);

  protected respond<T>(value: T): Observable<T> {
    if (this.scenarios.current() === 'networkError') {
      return of(null).pipe(
        delay(this.scenarios.delay()),
        switchMap(() => throwError(() => new SimulatedNetworkError())),
      );
    }
    return of(value).pipe(delay(this.scenarios.delay()));
  }
}

@Injectable()
export class MockAuthenticationRepository
  extends MockRepositoryBase
  implements AuthenticationRepository
{
  login(email: string, password: string): Observable<Customer> {
    if (email.toLowerCase() !== 'demo@solventa.co' || password !== 'Solventa123') {
      return of(null).pipe(
        delay(this.scenarios.delay()),
        switchMap(() => throwError(() => new InvalidCredentialsError())),
      );
    }
    return this.respond(DEMO_CUSTOMER);
  }
  loginAsDemo(): Observable<Customer> {
    return this.respond(DEMO_CUSTOMER);
  }
  requestPasswordReset(_email: string): Observable<void> {
    return this.respond(undefined);
  }
}

@Injectable()
export class MockCustomerRepository extends MockRepositoryBase implements CustomerRepository {
  register(customer: Omit<Customer, 'id' | 'kycStatus'>): Observable<Customer> {
    return this.respond({ ...customer, id: 'customer-new', kycStatus: 'pending' });
  }
  completeKyc(customer: Customer): Observable<Customer> {
    return this.respond({ ...customer, kycStatus: 'approved' });
  }
}

@Injectable()
export class MockConsentRepository extends MockRepositoryBase implements ConsentRepository {
  save(consent: ConsentRecord): Observable<ConsentRecord> {
    return this.respond(consent);
  }
}

@Injectable()
export class MockQuoteRepository extends MockRepositoryBase implements QuoteRepository {
  getTravelPlans(_details: TravelDetails, _personalized: boolean): Observable<TravelPlan[]> {
    if (this.scenarios.current() === 'quoteUnavailable') {
      return of(null).pipe(
        delay(this.scenarios.delay()),
        switchMap(() => throwError(() => new QuoteUnavailableError())),
      );
    }
    return this.respond(PLANS);
  }
}

@Injectable()
export class MockPolicyRepository extends MockRepositoryBase implements PolicyRepository {
  private readonly policies = signal<Policy[]>(structuredClone(INITIAL_POLICIES));
  list(): Observable<Policy[]> {
    return this.respond(this.scenarios.current() === 'empty' ? [] : this.policies());
  }
  getById(id: string): Observable<Policy | undefined> {
    return this.respond(this.policies().find((policy) => policy.id === id));
  }
  issue(plan: TravelPlan): Observable<Policy> {
    const policy: Policy = { ...INITIAL_POLICIES[0], premiumCop: plan.priceCop };
    this.policies.update((items) => [policy, ...items.filter((item) => item.id !== policy.id)]);
    return this.respond(policy);
  }
}

@Injectable()
export class MockClaimRepository extends MockRepositoryBase implements ClaimRepository {
  private readonly claims = signal<Claim[]>(structuredClone(INITIAL_CLAIMS));
  list(): Observable<Claim[]> {
    return this.respond(this.scenarios.current() === 'empty' ? [] : this.claims());
  }
  getById(id: string): Observable<Claim | undefined> {
    return this.respond(this.claims().find((claim) => claim.id === id));
  }
  submit(draft: ClaimDraft): Observable<Claim> {
    if (this.scenarios.current() === 'claimError') {
      return of(null).pipe(
        delay(this.scenarios.delay()),
        switchMap(() => throwError(() => new ClaimSubmissionError())),
      );
    }
    const claim: Claim = {
      id: 'SIN-2026-1058',
      policyId: draft.policyId,
      type: draft.type,
      status: 'submitted',
      eventDate: draft.eventDate,
      description: draft.description,
      location: draft.location,
    };
    this.claims.update((items) => [claim, ...items.filter((item) => item.id !== claim.id)]);
    return this.respond(claim);
  }
}

@Injectable()
export class MockPaymentRepository extends MockRepositoryBase implements PaymentRepository {
  private readonly payments = signal<Payment[]>(structuredClone(INITIAL_PAYMENTS));
  list(): Observable<Payment[]> {
    return this.respond(this.scenarios.current() === 'empty' ? [] : this.payments());
  }
  pay(amountCop: number): Observable<Payment> {
    if (this.scenarios.current() === 'paymentRejected') {
      return of(null).pipe(
        delay(this.scenarios.delay()),
        switchMap(() => throwError(() => new PaymentRejectedError())),
      );
    }
    const payment: Payment = {
      id: 'PAY-2026-3510',
      amountCop,
      methodLabel: '•••• 4821',
      status: 'approved',
      createdAt: '2026-09-11',
    };
    this.payments.update((items) => [payment, ...items.filter((item) => item.id !== payment.id)]);
    return this.respond(payment);
  }
}

@Injectable()
export class MockNotificationRepository
  extends MockRepositoryBase
  implements NotificationRepository
{
  private readonly notifications = signal<SolventaNotification[]>(
    structuredClone(INITIAL_NOTIFICATIONS),
  );
  list(): Observable<SolventaNotification[]> {
    return this.respond(this.scenarios.current() === 'empty' ? [] : this.notifications());
  }
  markRead(id: string): Observable<void> {
    this.notifications.update((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    return this.respond(undefined);
  }
  markAllRead(): Observable<void> {
    this.notifications.update((items) => items.map((item) => ({ ...item, read: true })));
    return this.respond(undefined);
  }
}
