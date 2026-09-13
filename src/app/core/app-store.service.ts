import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  AUTHENTICATION_REPOSITORY,
  CLAIM_REPOSITORY,
  CONSENT_REPOSITORY,
  CUSTOMER_REPOSITORY,
  NOTIFICATION_REPOSITORY,
  PAYMENT_REPOSITORY,
  POLICY_REPOSITORY,
  QUOTE_REPOSITORY,
} from '../data-access/repository.tokens';
import {
  AppSession,
  Claim,
  ClaimDraft,
  ConsentRecord,
  Customer,
  Payment,
  Policy,
  SolventaNotification,
  TravelDetails,
  TravelPlan,
} from '../models/domain.models';

const SESSION_KEY = 'solventa.demo.session';
const QUOTE_KEY = 'solventa.demo.quote';

@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly authRepository = inject(AUTHENTICATION_REPOSITORY);
  private readonly customerRepository = inject(CUSTOMER_REPOSITORY);
  private readonly consentRepository = inject(CONSENT_REPOSITORY);
  private readonly quoteRepository = inject(QUOTE_REPOSITORY);
  private readonly policyRepository = inject(POLICY_REPOSITORY);
  private readonly claimRepository = inject(CLAIM_REPOSITORY);
  private readonly paymentRepository = inject(PAYMENT_REPOSITORY);
  private readonly notificationRepository = inject(NOTIFICATION_REPOSITORY);

  readonly session = signal<AppSession | null>(this.restoreSession());
  readonly authenticated = computed(() => this.session() !== null);
  readonly role = computed(() => this.session()?.role ?? null);
  readonly customer = computed(() => {
    const session = this.session();
    return session?.role === 'CLIENT' ? session.profile : null;
  });
  readonly advisor = computed(() => {
    const session = this.session();
    return session?.role === 'ADVISOR' ? session.profile : null;
  });
  readonly registrationCustomer = signal<Customer | null>(null);
  readonly consent = signal<ConsentRecord | null>(null);
  readonly travelDetails = signal<TravelDetails | null>(this.restoreQuote());
  readonly plans = signal<TravelPlan[]>([]);
  readonly selectedPlan = signal<TravelPlan | null>(null);
  readonly payment = signal<Payment | null>(null);
  readonly otpVerified = signal(false);
  readonly issuedPolicy = signal<Policy | null>(null);
  readonly submittedClaim = signal<Claim | null>(null);
  readonly policies = signal<Policy[]>([]);
  readonly claims = signal<Claim[]>([]);
  readonly payments = signal<Payment[]>([]);
  readonly notifications = signal<SolventaNotification[]>([]);
  readonly unreadNotifications = computed(
    () => this.notifications().filter((item) => !item.read).length,
  );

  login(email: string, password: string): Observable<AppSession> {
    return this.authRepository
      .login(email, password)
      .pipe(tap((session) => this.startSession(session)));
  }

  loginAsDemo(): Observable<AppSession> {
    return this.authRepository.loginAsDemo().pipe(tap((session) => this.startSession(session)));
  }

  requestPasswordReset(email: string): Observable<void> {
    return this.authRepository.requestPasswordReset(email);
  }

  register(customer: Omit<Customer, 'id' | 'kycStatus'>): Observable<Customer> {
    return this.customerRepository
      .register(customer)
      .pipe(tap((value) => this.registrationCustomer.set(value)));
  }

  saveConsent(consent: ConsentRecord): Observable<ConsentRecord> {
    return this.consentRepository.save(consent).pipe(tap((value) => this.consent.set(value)));
  }

  completeKyc(): Observable<Customer> {
    const customer = this.registrationCustomer();
    if (!customer) throw new Error('Registration customer is missing');
    return this.customerRepository.completeKyc(customer).pipe(
      tap((value) => {
        this.registrationCustomer.set(value);
        this.startSession({ role: 'CLIENT', profile: value });
      }),
    );
  }

  setTravelDetails(details: TravelDetails): void {
    this.travelDetails.set(details);
    sessionStorage.setItem(QUOTE_KEY, JSON.stringify(details));
    this.plans.set([]);
    this.selectedPlan.set(null);
    this.payment.set(null);
    this.otpVerified.set(false);
    this.issuedPolicy.set(null);
  }

  calculatePlans(personalized: boolean): Observable<TravelPlan[]> {
    const details = this.travelDetails();
    if (!details) throw new Error('Travel details are missing');
    return this.quoteRepository
      .getTravelPlans(details, personalized)
      .pipe(tap((plans) => this.plans.set(plans)));
  }

  choosePlan(plan: TravelPlan): void {
    this.selectedPlan.set(plan);
    this.payment.set(null);
    this.otpVerified.set(false);
    this.issuedPolicy.set(null);
  }

  submitPayment(): Observable<Payment> {
    const plan = this.selectedPlan();
    if (!plan) throw new Error('Selected plan is missing');
    return this.paymentRepository
      .pay(plan.priceCop)
      .pipe(tap((payment) => this.payment.set(payment)));
  }

  verifyOtp(otp: string): boolean {
    const valid = otp === '123456';
    this.otpVerified.set(valid);
    return valid;
  }

  issuePolicy(): Observable<Policy> {
    const plan = this.selectedPlan();
    if (!plan || !this.otpVerified()) throw new Error('Purchase flow is incomplete');
    return this.policyRepository.issue(plan).pipe(
      tap((policy) => {
        this.issuedPolicy.set(policy);
        sessionStorage.removeItem(QUOTE_KEY);
      }),
    );
  }

  loadPolicies(): Observable<Policy[]> {
    return this.policyRepository.list().pipe(tap((items) => this.policies.set(items)));
  }

  loadClaims(): Observable<Claim[]> {
    return this.claimRepository.list().pipe(tap((items) => this.claims.set(items)));
  }

  submitClaim(draft: ClaimDraft): Observable<Claim> {
    return this.claimRepository.submit(draft).pipe(tap((claim) => this.submittedClaim.set(claim)));
  }

  loadPayments(): Observable<Payment[]> {
    return this.paymentRepository.list().pipe(tap((items) => this.payments.set(items)));
  }

  loadNotifications(): Observable<SolventaNotification[]> {
    return this.notificationRepository.list().pipe(tap((items) => this.notifications.set(items)));
  }

  markNotificationRead(id: string): Observable<void> {
    return this.notificationRepository
      .markRead(id)
      .pipe(
        tap(() =>
          this.notifications.update((items) =>
            items.map((item) => (item.id === id ? { ...item, read: true } : item)),
          ),
        ),
      );
  }

  markAllNotificationsRead(): Observable<void> {
    return this.notificationRepository
      .markAllRead()
      .pipe(
        tap(() =>
          this.notifications.update((items) => items.map((item) => ({ ...item, read: true }))),
        ),
      );
  }

  logout(): void {
    this.session.set(null);
    this.registrationCustomer.set(null);
    this.consent.set(null);
    this.travelDetails.set(null);
    this.plans.set([]);
    this.selectedPlan.set(null);
    this.payment.set(null);
    this.otpVerified.set(false);
    this.issuedPolicy.set(null);
    this.submittedClaim.set(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(QUOTE_KEY);
  }

  private startSession(session: AppSession): void {
    this.session.set(session);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private restoreSession(): AppSession | null {
    try {
      const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null') as
        AppSession | Customer | null;
      if (!stored) return null;
      if ('role' in stored && 'profile' in stored) return stored;
      return { role: 'CLIENT', profile: stored };
    } catch {
      return null;
    }
  }

  private restoreQuote(): TravelDetails | null {
    try {
      return JSON.parse(sessionStorage.getItem(QUOTE_KEY) ?? 'null') as TravelDetails | null;
    } catch {
      return null;
    }
  }
}
