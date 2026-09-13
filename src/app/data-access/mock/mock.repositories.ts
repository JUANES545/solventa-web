import { Injectable, inject, signal } from '@angular/core';
import { Observable, delay, of, switchMap, throwError } from 'rxjs';
import {
  AdvisorCustomerRepository,
  AssistedQuoteRepository,
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
  AdvisorCustomer,
  AdvisorCustomerSummary,
  AdvisorProfile,
  AppSession,
  AssistedQuote,
  AssistedQuoteDraft,
  AssistedQuoteStatus,
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

export const DEMO_ADVISOR: AdvisorProfile = {
  id: 'advisor-demo',
  fullName: 'Laura Martínez',
  email: 'asesor@solventa.co',
  role: 'ADVISOR',
};

export const ADVISOR_CUSTOMERS: AdvisorCustomer[] = [
  { ...DEMO_CUSTOMER, consentStatus: 'recorded', nextRenewalDate: '2026-10-19' },
  {
    id: 'customer-ana',
    fullName: 'Ana Torres',
    email: 'ana.torres@example.com',
    documentNumber: '52110487',
    kycStatus: 'approved',
    consentStatus: 'recorded',
    nextRenewalDate: '2026-11-18',
  },
  {
    id: 'customer-mateo',
    fullName: 'Mateo Restrepo',
    email: 'mateo.restrepo@example.com',
    documentNumber: '1018427391',
    kycStatus: 'pending',
    consentStatus: 'pending',
  },
  {
    id: 'customer-camila',
    fullName: 'Camila Rojas',
    email: 'camila.rojas@example.com',
    documentNumber: '1032456798',
    kycStatus: 'approved',
    consentStatus: 'pending',
    nextRenewalDate: '2026-10-08',
  },
  {
    id: 'customer-daniel',
    fullName: 'Daniel Ruiz',
    email: 'daniel.ruiz@example.com',
    documentNumber: '80145672',
    kycStatus: 'approved',
    consentStatus: 'recorded',
  },
];

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

const CUSTOMER_POLICY_SUMMARIES: Record<string, AdvisorCustomerSummary['policies']> = {
  'customer-demo': INITIAL_POLICIES.slice(0, 2).map(({ id, product, status, validUntil }) => ({
    id,
    product,
    status,
    validUntil,
  })),
  'customer-ana': [
    {
      id: 'SOL-TRV-2026-2044',
      product: 'travel',
      status: 'active',
      validUntil: '2026-11-18',
    },
  ],
  'customer-mateo': [],
  'customer-camila': [
    {
      id: 'SOL-DEV-2026-0318',
      product: 'device',
      status: 'expiring',
      validUntil: '2026-10-08',
    },
  ],
  'customer-daniel': [
    {
      id: 'SOL-LIF-2026-0921',
      product: 'life',
      status: 'active',
      validUntil: '2027-04-21',
    },
  ],
};

const INITIAL_ASSISTED_QUOTES: AssistedQuote[] = [
  {
    id: 'COT-2026-0391',
    customerId: 'customer-demo',
    customerName: 'Valentina Gómez',
    advisorId: DEMO_ADVISOR.id,
    advisorName: DEMO_ADVISOR.fullName,
    travelDetails: {
      destination: 'España',
      departureDate: '2026-10-04',
      returnDate: '2026-10-19',
      travelers: 1,
    },
    planId: 'plus',
    priceCop: 139900,
    consentRecorded: true,
    consentChannel: 'clientPortal',
    status: 'sentToClient',
    createdAt: '2026-09-11',
  },
  {
    id: 'COT-2026-0387',
    customerId: 'customer-mateo',
    customerName: 'Mateo Restrepo',
    advisorId: DEMO_ADVISOR.id,
    advisorName: DEMO_ADVISOR.fullName,
    travelDetails: {
      destination: 'México',
      departureDate: '2026-11-12',
      returnDate: '2026-11-20',
      travelers: 2,
    },
    planId: 'essential',
    priceCop: 89900,
    consentRecorded: false,
    status: 'pendingConsent',
    createdAt: '2026-09-10',
  },
  {
    id: 'COT-2026-0379',
    customerId: 'customer-ana',
    customerName: 'Ana Torres',
    advisorId: DEMO_ADVISOR.id,
    advisorName: DEMO_ADVISOR.fullName,
    travelDetails: {
      destination: 'Argentina',
      departureDate: '2026-10-21',
      returnDate: '2026-10-29',
      travelers: 1,
    },
    planId: 'premium',
    priceCop: 219900,
    consentRecorded: true,
    consentChannel: 'recordedCall',
    status: 'readyToSubscribe',
    createdAt: '2026-09-08',
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
  login(email: string, password: string): Observable<AppSession> {
    const normalizedEmail = email.trim().toLowerCase();
    if (password === 'Solventa123' && normalizedEmail === DEMO_ADVISOR.email) {
      return this.respond({ role: 'ADVISOR', profile: DEMO_ADVISOR });
    }
    if (normalizedEmail !== DEMO_CUSTOMER.email || password !== 'Solventa123') {
      return of(null).pipe(
        delay(this.scenarios.delay()),
        switchMap(() => throwError(() => new InvalidCredentialsError())),
      );
    }
    return this.respond({ role: 'CLIENT', profile: DEMO_CUSTOMER });
  }
  loginAsDemo(): Observable<AppSession> {
    return this.respond({ role: 'CLIENT', profile: DEMO_CUSTOMER });
  }
  requestPasswordReset(_email: string): Observable<void> {
    return this.respond(undefined);
  }
}

@Injectable()
export class MockAdvisorCustomerRepository
  extends MockRepositoryBase
  implements AdvisorCustomerRepository
{
  search(query: string): Observable<AdvisorCustomer[]> {
    if (this.scenarios.current() === 'empty') return this.respond([]);
    const normalizedQuery = this.normalize(query);
    const matches = !normalizedQuery
      ? ADVISOR_CUSTOMERS
      : ADVISOR_CUSTOMERS.filter((customer) =>
          [customer.fullName, customer.email, customer.documentNumber].some((value) =>
            this.normalize(value).includes(normalizedQuery),
          ),
        );
    return this.respond(structuredClone(matches));
  }

  getSummary(customerId: string): Observable<AdvisorCustomerSummary | undefined> {
    const customer = ADVISOR_CUSTOMERS.find((item) => item.id === customerId);
    if (!customer || this.scenarios.current() === 'empty') return this.respond(undefined);
    return this.respond({
      customer: structuredClone(customer),
      policies: structuredClone(CUSTOMER_POLICY_SUMMARIES[customerId] ?? []),
    });
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }
}

@Injectable()
export class MockAssistedQuoteRepository
  extends MockRepositoryBase
  implements AssistedQuoteRepository
{
  private readonly quotes = signal<AssistedQuote[]>(structuredClone(INITIAL_ASSISTED_QUOTES));
  private sequence = 394;

  listByAdvisor(advisorId: string): Observable<AssistedQuote[]> {
    const matches = this.quotes().filter((quote) => quote.advisorId === advisorId);
    return this.respond(this.scenarios.current() === 'empty' ? [] : structuredClone(matches));
  }

  listByCustomer(customerId: string): Observable<AssistedQuote[]> {
    const matches = this.quotes().filter((quote) => quote.customerId === customerId);
    return this.respond(this.scenarios.current() === 'empty' ? [] : structuredClone(matches));
  }

  save(draft: AssistedQuoteDraft): Observable<AssistedQuote> {
    const quote: AssistedQuote = {
      id: `COT-2026-${String(this.sequence++).padStart(4, '0')}`,
      customerId: draft.customerId,
      customerName: draft.customerName,
      advisorId: draft.advisorId,
      advisorName: draft.advisorName,
      travelDetails: structuredClone(draft.travelDetails),
      planId: draft.plan.id,
      priceCop: draft.plan.priceCop,
      consentRecorded: draft.consentRecorded,
      consentChannel: draft.consentChannel,
      status: draft.consentRecorded ? 'active' : 'pendingConsent',
      createdAt: '2026-09-13',
    };
    this.quotes.update((items) => [quote, ...items]);
    return this.respond(structuredClone(quote));
  }

  updateStatus(id: string, status: AssistedQuoteStatus): Observable<AssistedQuote> {
    const current = this.quotes().find((quote) => quote.id === id);
    if (!current) return throwError(() => new Error('Assisted quote not found'));
    const updated = { ...current, status };
    this.quotes.update((items) => items.map((quote) => (quote.id === id ? updated : quote)));
    return this.respond(structuredClone(updated));
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
