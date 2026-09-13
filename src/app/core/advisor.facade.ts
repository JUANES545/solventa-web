import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, tap, throwError } from 'rxjs';
import {
  ADVISOR_CUSTOMER_REPOSITORY,
  ASSISTED_QUOTE_REPOSITORY,
  QUOTE_REPOSITORY,
} from '../data-access/repository.tokens';
import {
  AdvisorCustomer,
  AdvisorCustomerContext,
  AdvisorCustomerSummary,
  AssistedQuote,
  AssistedQuoteStatus,
  AsyncStatus,
  ConsentChannel,
  TravelDetails,
  TravelPlan,
} from '../models/domain.models';
import { AppStore } from './app-store.service';

const CLIENT_CONTEXT_KEY = 'solventa.advisor.client-context';

@Injectable({ providedIn: 'root' })
export class AdvisorFacade {
  private readonly customersRepository = inject(ADVISOR_CUSTOMER_REPOSITORY);
  private readonly quotesRepository = inject(ASSISTED_QUOTE_REPOSITORY);
  private readonly travelQuoteRepository = inject(QUOTE_REPOSITORY);
  private readonly appStore = inject(AppStore);

  readonly customers = signal<AdvisorCustomer[]>([]);
  readonly customerListStatus = signal<AsyncStatus>('idle');
  readonly selectedCustomer = signal<AdvisorCustomerContext | null>(this.restoreContext());
  readonly customerSummary = signal<AdvisorCustomerSummary | null>(null);
  readonly customerQuotes = signal<AssistedQuote[]>([]);
  readonly summaryStatus = signal<AsyncStatus>('idle');
  readonly quotes = signal<AssistedQuote[]>([]);
  readonly quoteHistoryStatus = signal<AsyncStatus>('idle');
  readonly travelDetails = signal<TravelDetails | null>(null);
  readonly plans = signal<TravelPlan[]>([]);
  readonly plansStatus = signal<AsyncStatus>('idle');
  readonly selectedPlan = signal<TravelPlan | null>(null);
  readonly savedQuote = signal<AssistedQuote | null>(null);

  readonly clientsAttended = computed(
    () => new Set(this.quotes().map((quote) => quote.customerId)).size,
  );
  readonly activeQuotes = computed(
    () => this.quotes().filter((quote) => quote.status !== 'pendingConsent').length,
  );
  readonly pendingConsent = computed(
    () => this.customers().filter((customer) => customer.consentStatus === 'pending').length,
  );
  readonly upcomingRenewals = computed(
    () => this.customers().filter((customer) => customer.nextRenewalDate).length,
  );

  loadCustomers(query = ''): void {
    this.customerListStatus.set('loading');
    this.customersRepository.search(query).subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.customerListStatus.set(customers.length ? 'success' : 'empty');
      },
      error: () => this.customerListStatus.set('error'),
    });
  }

  selectCustomer(customer: AdvisorCustomer): void {
    const context = { id: customer.id, fullName: customer.fullName };
    this.selectedCustomer.set(context);
    sessionStorage.setItem(CLIENT_CONTEXT_KEY, JSON.stringify(context));
    this.resetQuote();
  }

  closeCustomerContext(): void {
    this.selectedCustomer.set(null);
    this.customerSummary.set(null);
    this.customerQuotes.set([]);
    this.resetQuote();
    sessionStorage.removeItem(CLIENT_CONTEXT_KEY);
  }

  loadCustomerSummary(customerId: string): void {
    this.summaryStatus.set('loading');
    forkJoin({
      summary: this.customersRepository.getSummary(customerId),
      quotes: this.quotesRepository.listByCustomer(customerId),
    }).subscribe({
      next: ({ summary, quotes }) => {
        this.customerSummary.set(summary ?? null);
        this.customerQuotes.set(quotes);
        if (summary) this.selectCustomer(summary.customer);
        this.summaryStatus.set(summary ? 'success' : 'empty');
      },
      error: () => this.summaryStatus.set('error'),
    });
  }

  loadQuoteHistory(): void {
    const advisor = this.appStore.advisor();
    if (!advisor) return;
    this.quoteHistoryStatus.set('loading');
    this.quotesRepository.listByAdvisor(advisor.id).subscribe({
      next: (quotes) => {
        this.quotes.set(quotes);
        this.quoteHistoryStatus.set(quotes.length ? 'success' : 'empty');
      },
      error: () => this.quoteHistoryStatus.set('error'),
    });
  }

  calculatePlans(details: TravelDetails): void {
    this.travelDetails.set(details);
    this.selectedPlan.set(null);
    this.savedQuote.set(null);
    this.plansStatus.set('loading');
    this.travelQuoteRepository.getTravelPlans(details, false).subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.plansStatus.set(plans.length ? 'success' : 'empty');
      },
      error: () => this.plansStatus.set('error'),
    });
  }

  choosePlan(plan: TravelPlan): void {
    this.selectedPlan.set(plan);
    this.savedQuote.set(null);
  }

  saveQuote(consentRecorded: boolean, consentChannel?: ConsentChannel): Observable<AssistedQuote> {
    const customer = this.selectedCustomer();
    const advisor = this.appStore.advisor();
    const travelDetails = this.travelDetails();
    const plan = this.selectedPlan();
    if (!customer || !advisor || !travelDetails || !plan) {
      return throwError(() => new Error('Assisted quote context is incomplete'));
    }
    return this.quotesRepository
      .save({
        customerId: customer.id,
        customerName: customer.fullName,
        advisorId: advisor.id,
        advisorName: advisor.fullName,
        travelDetails,
        plan,
        consentRecorded,
        consentChannel: consentRecorded ? consentChannel : undefined,
      })
      .pipe(
        tap((quote) => {
          this.savedQuote.set(quote);
          this.quotes.update((items) => [quote, ...items]);
          this.customerQuotes.update((items) => [quote, ...items]);
        }),
      );
  }

  updateSavedQuoteStatus(status: AssistedQuoteStatus): Observable<AssistedQuote> {
    const quote = this.savedQuote();
    if (!quote) return throwError(() => new Error('There is no assisted quote to update'));
    if (status === 'readyToSubscribe' && !quote.consentRecorded) {
      return throwError(() => new Error('Customer consent is required'));
    }
    return this.quotesRepository.updateStatus(quote.id, status).pipe(
      tap((updated) => {
        this.savedQuote.set(updated);
        this.quotes.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
        this.customerQuotes.update((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
      }),
    );
  }

  resetQuote(): void {
    this.travelDetails.set(null);
    this.plans.set([]);
    this.plansStatus.set('idle');
    this.selectedPlan.set(null);
    this.savedQuote.set(null);
  }

  private restoreContext(): AdvisorCustomerContext | null {
    try {
      return JSON.parse(
        sessionStorage.getItem(CLIENT_CONTEXT_KEY) ?? 'null',
      ) as AdvisorCustomerContext | null;
    } catch {
      return null;
    }
  }
}
