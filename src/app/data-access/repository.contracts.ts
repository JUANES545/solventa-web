import { Observable } from 'rxjs';
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
} from '../models/domain.models';

export interface AuthenticationRepository {
  login(email: string, password: string): Observable<Customer>;
  loginAsDemo(): Observable<Customer>;
  requestPasswordReset(email: string): Observable<void>;
}

export interface CustomerRepository {
  register(customer: Omit<Customer, 'id' | 'kycStatus'>): Observable<Customer>;
  completeKyc(customer: Customer): Observable<Customer>;
}

export interface ConsentRepository {
  save(consent: ConsentRecord): Observable<ConsentRecord>;
}

export interface QuoteRepository {
  getTravelPlans(details: TravelDetails, personalized: boolean): Observable<TravelPlan[]>;
}

export interface PolicyRepository {
  list(): Observable<Policy[]>;
  getById(id: string): Observable<Policy | undefined>;
  issue(plan: TravelPlan): Observable<Policy>;
}

export interface ClaimRepository {
  list(): Observable<Claim[]>;
  getById(id: string): Observable<Claim | undefined>;
  submit(draft: ClaimDraft): Observable<Claim>;
}

export interface PaymentRepository {
  list(): Observable<Payment[]>;
  pay(amountCop: number): Observable<Payment>;
}

export interface NotificationRepository {
  list(): Observable<SolventaNotification[]>;
  markRead(id: string): Observable<void>;
  markAllRead(): Observable<void>;
}
