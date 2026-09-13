export type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export type AppRole = 'CLIENT' | 'ADVISOR';

export interface AdvisorProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'ADVISOR';
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  documentNumber: string;
  kycStatus: 'pending' | 'approved' | 'failed';
}

export type AppSession =
  { role: 'CLIENT'; profile: Customer } | { role: 'ADVISOR'; profile: AdvisorProfile };

export type ConsentStatus = 'recorded' | 'pending';

export interface AdvisorCustomer extends Customer {
  consentStatus: ConsentStatus;
  nextRenewalDate?: string;
}

export interface AdvisorCustomerContext {
  id: string;
  fullName: string;
}

export interface AdvisorPolicySummary {
  id: string;
  product: Policy['product'];
  status: PolicyStatus;
  validUntil: string;
}

export interface AdvisorCustomerSummary {
  customer: AdvisorCustomer;
  policies: AdvisorPolicySummary[];
}

export interface ConsentRecord {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  openFinanceAuthorized: boolean;
}

export interface TravelDetails {
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
}

export interface TravelPlan {
  id: 'essential' | 'plus' | 'premium';
  priceCop: number;
  medicalCoverageCop: number;
  baggageCoverageCop: number;
  delayCoverageCop: number;
  recommended?: boolean;
}

export type AssistedQuoteStatus = 'active' | 'pendingConsent' | 'sentToClient' | 'readyToSubscribe';

export type ConsentChannel = 'clientPortal' | 'recordedCall';

export interface AssistedQuote {
  id: string;
  customerId: string;
  customerName: string;
  advisorId: string;
  advisorName: string;
  travelDetails: TravelDetails;
  planId: TravelPlan['id'];
  priceCop: number;
  consentRecorded: boolean;
  consentChannel?: ConsentChannel;
  status: AssistedQuoteStatus;
  createdAt: string;
}

export interface AssistedQuoteDraft {
  customerId: string;
  customerName: string;
  advisorId: string;
  advisorName: string;
  travelDetails: TravelDetails;
  plan: TravelPlan;
  consentRecorded: boolean;
  consentChannel?: ConsentChannel;
}

export type PolicyStatus = 'active' | 'expiring' | 'expired';

export interface Policy {
  id: string;
  product: 'travel' | 'life' | 'device' | 'parametric';
  name: string;
  status: PolicyStatus;
  premiumCop: number;
  validFrom: string;
  validUntil: string;
  coverageKeys: string[];
}

export type ClaimStatus = 'submitted' | 'inReview' | 'approved' | 'closed';

export interface Claim {
  id: string;
  policyId: string;
  type: 'flightDelay' | 'lostBaggage' | 'medicalAssistance';
  status: ClaimStatus;
  eventDate: string;
  description: string;
  location: string;
}

export interface ClaimDraft {
  policyId: string;
  type: Claim['type'];
  eventDate: string;
  description: string;
  location: string;
  evidenceNames: string[];
}

export type PaymentStatus = 'approved' | 'pending' | 'rejected';

export interface Payment {
  id: string;
  policyId?: string;
  amountCop: number;
  methodLabel: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface SolventaNotification {
  id: string;
  type: 'payment' | 'expiration' | 'claim' | 'adjuster';
  titleKey: string;
  bodyKey: string;
  createdAt: string;
  read: boolean;
}

export type TestScenario =
  | 'normal'
  | 'empty'
  | 'networkError'
  | 'slow'
  | 'sessionExpired'
  | 'paymentRejected'
  | 'quoteUnavailable'
  | 'claimSuccess'
  | 'claimError';

export type ThemePreference = 'system' | 'light' | 'dark';
