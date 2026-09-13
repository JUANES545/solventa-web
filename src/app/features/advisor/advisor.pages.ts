import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AdvisorFacade } from '../../core/advisor.facade';
import {
  AdvisorCustomer,
  AssistedQuoteStatus,
  ConsentChannel,
  TravelPlan,
} from '../../models/domain.models';
import { CopPipe, LocalDatePipe } from '../../shared/format.pipes';
import { SvgIconComponent } from '../../shared/svg-icon.component';
import {
  PlanComparisonComponent,
  TravelDetailsFormComponent,
  TravelQuoteRequest,
} from '../../shared/travel-quote.components';
import { ErrorStateComponent, LoadingStateComponent } from '../../shared/ui.components';

@Component({
  selector: 'app-advisor-dashboard-page',
  imports: [RouterLink, TranslocoPipe, CopPipe, LoadingStateComponent, ErrorStateComponent],
  template: `<section class="page-stack">
    <div class="dashboard-heading">
      <div>
        <span class="eyebrow">{{ 'advisor.dashboard.eyebrow' | transloco }}</span>
        <h1>{{ 'advisor.dashboard.title' | transloco }}</h1>
        <p>{{ 'advisor.dashboard.subtitle' | transloco }}</p>
      </div>
      <a class="button primary" routerLink="/advisor/clients">{{
        'advisor.clients.find' | transloco
      }}</a>
    </div>
    @if (loading()) {
      <app-loading-state />
    } @else if (error()) {
      <app-error-state (retry)="load()" />
    } @else {
      <div class="metric-grid advisor-metrics">
        <article class="metric-card">
          <span>{{ 'advisor.dashboard.clientsAttended' | transloco }}</span
          ><strong>{{ facade.clientsAttended() }}</strong>
        </article>
        <article class="metric-card">
          <span>{{ 'advisor.dashboard.activeQuotes' | transloco }}</span
          ><strong>{{ facade.activeQuotes() }}</strong>
        </article>
        <article class="metric-card accent-soft">
          <span>{{ 'advisor.dashboard.pendingConsent' | transloco }}</span
          ><strong>{{ facade.pendingConsent() }}</strong>
        </article>
        <article class="metric-card">
          <span>{{ 'advisor.dashboard.upcomingRenewals' | transloco }}</span
          ><strong>{{ facade.upcomingRenewals() }}</strong>
        </article>
      </div>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-heading">
            <h2>{{ 'advisor.dashboard.recentQuotes' | transloco }}</h2>
            <a class="text-link-icon" routerLink="/advisor/quotes">{{
              'advisor.quotes.viewAll' | transloco
            }}</a>
          </div>
          @if (facade.quotes().length) {
            <div class="compact-list">
              @for (quote of facade.quotes().slice(0, 3); track quote.id) {
                <div class="compact-item">
                  <span class="item-icon"
                    ><span aria-hidden="true">{{ quote.customerName[0] }}</span></span
                  >
                  <span
                    ><strong>{{ quote.customerName }}</strong
                    ><small
                      >{{ quote.travelDetails.destination }} · {{ quote.priceCop | cop }}</small
                    ></span
                  >
                  <span class="status" [class]="'status ' + quote.status">{{
                    'advisor.status.' + quote.status | transloco
                  }}</span>
                </div>
              }
            </div>
          } @else {
            <p>{{ 'advisor.quotes.empty' | transloco }}</p>
          }
        </section>
        <section class="panel advisor-next-step">
          <span class="feature-icon"><span aria-hidden="true">→</span></span>
          <h2>{{ 'advisor.dashboard.nextTitle' | transloco }}</h2>
          <p>{{ 'advisor.dashboard.nextBody' | transloco }}</p>
          <a class="button conversion" routerLink="/advisor/clients">{{
            'advisor.clients.find' | transloco
          }}</a>
        </section>
      </div>
    }
  </section>`,
})
export class AdvisorDashboardPage implements OnInit {
  readonly facade = inject(AdvisorFacade);

  ngOnInit(): void {
    this.load();
  }

  loading(): boolean {
    return (
      this.facade.customerListStatus() === 'loading' ||
      this.facade.quoteHistoryStatus() === 'loading'
    );
  }

  error(): boolean {
    return (
      this.facade.customerListStatus() === 'error' || this.facade.quoteHistoryStatus() === 'error'
    );
  }

  load(): void {
    this.facade.loadCustomers();
    this.facade.loadQuoteHistory();
  }
}

@Component({
  selector: 'app-advisor-clients-page',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    LocalDatePipe,
    SvgIconComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  template: `<section class="page-stack">
    <div class="page-heading">
      <span class="eyebrow">{{ 'advisor.clients.eyebrow' | transloco }}</span>
      <h1>{{ 'advisor.clients.title' | transloco }}</h1>
      <p>{{ 'advisor.clients.subtitle' | transloco }}</p>
    </div>
    <form class="panel advisor-search" [formGroup]="form" (ngSubmit)="search()" role="search">
      <div>
        <label for="client-search">{{ 'advisor.clients.searchLabel' | transloco }}</label>
        <input
          id="client-search"
          type="search"
          formControlName="query"
          [placeholder]="'advisor.clients.searchPlaceholder' | transloco"
        />
      </div>
      <button class="button primary" type="submit">
        {{ 'advisor.clients.search' | transloco }}
      </button>
      @if (form.controls.query.value) {
        <button class="button secondary" type="button" (click)="clear()">
          {{ 'advisor.clients.clear' | transloco }}
        </button>
      }
    </form>
    @if (facade.customerListStatus() === 'loading') {
      <app-loading-state labelKey="advisor.clients.loading" />
    } @else if (facade.customerListStatus() === 'error') {
      <app-error-state (retry)="search()" />
    } @else if (facade.customerListStatus() === 'empty') {
      <div class="empty-state">
        <p>{{ 'advisor.clients.empty' | transloco }}</p>
      </div>
    } @else {
      <div class="advisor-client-list">
        @for (customer of facade.customers(); track customer.id) {
          <article class="entity-card advisor-client-card">
            <div class="advisor-client-identity">
              <span class="avatar" aria-hidden="true">{{ initials(customer.fullName) }}</span>
              <div>
                <h2>{{ customer.fullName }}</h2>
                <p>{{ customer.email }}</p>
              </div>
            </div>
            <dl class="advisor-client-facts">
              <div>
                <dt>{{ 'profile.document' | transloco }}</dt>
                <dd>{{ customer.documentNumber }}</dd>
              </div>
              <div>
                <dt>KYC</dt>
                <dd>
                  <span class="status" [class]="'status ' + customer.kycStatus">{{
                    'advisor.kyc.' + customer.kycStatus | transloco
                  }}</span>
                </dd>
              </div>
              <div>
                <dt>{{ 'advisor.consent.label' | transloco }}</dt>
                <dd>
                  <span class="status" [class]="'status ' + customer.consentStatus">{{
                    'advisor.consent.' + customer.consentStatus | transloco
                  }}</span>
                </dd>
              </div>
              <div>
                <dt>{{ 'advisor.clients.renewal' | transloco }}</dt>
                <dd>
                  {{ customer.nextRenewalDate ? (customer.nextRenewalDate | localDate) : '—' }}
                </dd>
              </div>
            </dl>
            <button class="button secondary full" type="button" (click)="select(customer)">
              {{ 'advisor.clients.open' | transloco }}<app-icon name="arrow-right" [size]="17" />
            </button>
          </article>
        }
      </div>
    }
  </section>`,
})
export class AdvisorClientsPage implements OnInit {
  readonly facade = inject(AdvisorFacade);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly form = this.fb.nonNullable.group({ query: [''] });

  ngOnInit(): void {
    this.facade.loadCustomers();
  }

  search(): void {
    this.facade.loadCustomers(this.form.controls.query.value);
  }

  clear(): void {
    this.form.reset({ query: '' });
    this.search();
  }

  select(customer: AdvisorCustomer): void {
    this.facade.selectCustomer(customer);
    void this.router.navigate(['/advisor/clients', customer.id]);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('');
  }
}

@Component({
  selector: 'app-advisor-client-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    LocalDatePipe,
    SvgIconComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  template: `<section class="page-stack">
    <a class="back-link" routerLink="/advisor/clients"
      ><app-icon name="arrow-left" [size]="17" />{{ 'advisor.clients.back' | transloco }}</a
    >
    @if (facade.summaryStatus() === 'loading') {
      <app-loading-state labelKey="advisor.clients.loadingDetail" />
    } @else if (facade.summaryStatus() === 'error') {
      <app-error-state (retry)="load()" />
    } @else if (!facade.customerSummary()) {
      <div class="empty-state">
        <p>{{ 'advisor.clients.notFound' | transloco }}</p>
      </div>
    } @else {
      <div class="page-heading split">
        <div>
          <span class="eyebrow">{{ 'advisor.clients.record' | transloco }}</span>
          <h1>{{ facade.customerSummary()!.customer.fullName }}</h1>
          <p>{{ 'advisor.clients.recordSubtitle' | transloco }}</p>
        </div>
        <a class="button conversion" routerLink="/advisor/quote">{{
          'advisor.quote.start' | transloco
        }}</a>
      </div>
      <div class="advisor-summary-grid">
        <section class="panel">
          <h2>{{ 'advisor.clients.basicData' | transloco }}</h2>
          <dl class="profile-details">
            <div>
              <dt>{{ 'profile.email' | transloco }}</dt>
              <dd>{{ facade.customerSummary()!.customer.email }}</dd>
            </div>
            <div>
              <dt>{{ 'profile.document' | transloco }}</dt>
              <dd>{{ facade.customerSummary()!.customer.documentNumber }}</dd>
            </div>
          </dl>
        </section>
        <section class="panel">
          <h2>{{ 'advisor.clients.verifications' | transloco }}</h2>
          <dl class="profile-details">
            <div>
              <dt>KYC</dt>
              <dd>
                <span
                  class="status"
                  [class]="'status ' + facade.customerSummary()!.customer.kycStatus"
                  >{{
                    'advisor.kyc.' + facade.customerSummary()!.customer.kycStatus | transloco
                  }}</span
                >
              </dd>
            </div>
            <div>
              <dt>{{ 'advisor.consent.label' | transloco }}</dt>
              <dd>
                <span
                  class="status"
                  [class]="'status ' + facade.customerSummary()!.customer.consentStatus"
                  >{{
                    'advisor.consent.' + facade.customerSummary()!.customer.consentStatus
                      | transloco
                  }}</span
                >
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <div class="dashboard-grid">
        <section class="panel">
          <h2>{{ 'advisor.clients.currentPolicies' | transloco }}</h2>
          @if (facade.customerSummary()!.policies.length) {
            <div class="compact-list">
              @for (policy of facade.customerSummary()!.policies; track policy.id) {
                <div class="compact-item">
                  <span class="item-icon"><app-icon name="policy" [size]="20" /></span>
                  <span
                    ><strong>{{ 'products.' + policy.product | transloco }}</strong
                    ><small>{{ policy.validUntil | localDate }}</small></span
                  >
                  <span class="status" [class]="'status ' + policy.status">{{
                    'policies.' + policy.status | transloco
                  }}</span>
                </div>
              }
            </div>
          } @else {
            <p>{{ 'advisor.clients.noPolicies' | transloco }}</p>
          }
        </section>
        <section class="panel">
          <h2>{{ 'advisor.clients.recentQuotes' | transloco }}</h2>
          @if (facade.customerQuotes().length) {
            <div class="compact-list">
              @for (quote of facade.customerQuotes().slice(0, 3); track quote.id) {
                <div class="compact-item">
                  <span class="item-icon"><app-icon name="plane" [size]="20" /></span>
                  <span
                    ><strong>{{ quote.travelDetails.destination }}</strong
                    ><small>{{ quote.createdAt | localDate }}</small></span
                  >
                  <span class="status" [class]="'status ' + quote.status">{{
                    'advisor.status.' + quote.status | transloco
                  }}</span>
                </div>
              }
            </div>
          } @else {
            <p>{{ 'advisor.clients.noQuotes' | transloco }}</p>
          }
        </section>
      </div>
    }
  </section>`,
})
export class AdvisorClientDetailPage implements OnInit {
  readonly facade = inject(AdvisorFacade);
  private readonly route = inject(ActivatedRoute);
  readonly customerId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.facade.loadCustomerSummary(this.customerId);
  }
}

@Component({
  selector: 'app-assisted-quote-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    CopPipe,
    SvgIconComponent,
    TravelDetailsFormComponent,
    PlanComparisonComponent,
  ],
  template: `<section class="page-stack">
    <div class="page-heading">
      <span class="eyebrow">{{ 'advisor.quote.eyebrow' | transloco }}</span>
      <h1>{{ 'advisor.quote.title' | transloco }}</h1>
      <p>
        {{ 'advisor.quote.subtitle' | transloco: { name: facade.selectedCustomer()!.fullName } }}
      </p>
    </div>
    <section class="advisor-step">
      <div class="advisor-step-heading">
        <span>1</span>
        <div>
          <h2>{{ 'advisor.quote.tripTitle' | transloco }}</h2>
          <p>{{ 'advisor.quote.tripBody' | transloco }}</p>
        </div>
      </div>
      <app-travel-details-form
        [initialDetails]="facade.travelDetails()"
        [personalizationEnabled]="false"
        submitLabelKey="advisor.quote.compare"
        (submitted)="calculate($event)"
      />
    </section>
    @if (facade.plansStatus() !== 'idle') {
      <section class="advisor-step">
        <div class="advisor-step-heading">
          <span>2</span>
          <div>
            <h2>{{ 'advisor.quote.plansTitle' | transloco }}</h2>
            <p>{{ 'plans.subtitle' | transloco }}</p>
          </div>
        </div>
        <app-plan-comparison
          [plans]="facade.plans()"
          [status]="facade.plansStatus()"
          [selectedPlan]="facade.selectedPlan()"
          selectLabelKey="advisor.quote.choose"
          (planSelected)="selectPlan($event)"
          (retry)="retryPlans()"
        />
      </section>
    }
    @if (facade.selectedPlan()) {
      <section class="advisor-step">
        <div class="advisor-step-heading">
          <span>3</span>
          <div>
            <h2>{{ 'advisor.quote.consentTitle' | transloco }}</h2>
            <p>{{ 'advisor.quote.consentBody' | transloco }}</p>
          </div>
        </div>
        <div class="checkout-grid">
          <form class="panel form-panel" [formGroup]="consentForm" (ngSubmit)="save()">
            <div class="inline-alert info" role="note">
              <app-icon name="shield" [size]="19" />{{ 'advisor.quote.consentNotice' | transloco }}
            </div>
            <label class="choice-row">
              <input type="checkbox" formControlName="recorded" />
              <span
                ><strong>{{ 'advisor.quote.consentConfirmed' | transloco }}</strong
                ><small>{{ 'advisor.quote.consentConfirmedHint' | transloco }}</small></span
              >
            </label>
            @if (consentForm.controls.recorded.value) {
              <label for="consent-channel">{{ 'advisor.quote.channel' | transloco }}</label>
              <select id="consent-channel" formControlName="channel">
                <option value="clientPortal">{{ 'advisor.quote.clientPortal' | transloco }}</option>
                <option value="recordedCall">{{ 'advisor.quote.recordedCall' | transloco }}</option>
              </select>
            }
            @if (saveError()) {
              <div class="inline-alert error" role="alert">
                {{ 'advisor.quote.saveError' | transloco }}
              </div>
            }
            <button
              class="button conversion full"
              type="submit"
              [disabled]="saving() || !!facade.savedQuote()"
            >
              {{ (saving() ? 'common.loading' : 'advisor.quote.save') | transloco }}
            </button>
          </form>
          <section class="panel advisor-quote-summary">
            <h2>{{ 'advisor.quote.summary' | transloco }}</h2>
            <dl class="profile-details">
              <div>
                <dt>{{ 'checkout.customer' | transloco }}</dt>
                <dd>{{ facade.selectedCustomer()!.fullName }}</dd>
              </div>
              <div>
                <dt>{{ 'quote.destination' | transloco }}</dt>
                <dd>{{ facade.travelDetails()!.destination }}</dd>
              </div>
              <div>
                <dt>{{ 'checkout.plan' | transloco }}</dt>
                <dd>{{ 'plans.' + facade.selectedPlan()!.id | transloco }}</dd>
              </div>
              <div>
                <dt>{{ 'common.amount' | transloco }}</dt>
                <dd>{{ facade.selectedPlan()!.priceCop | cop }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </section>
    }
    @if (facade.savedQuote()) {
      <section class="advisor-quote-result" role="status">
        <span class="success-mark"><app-icon name="check" [size]="26" /></span>
        <div>
          <span class="eyebrow">{{ 'advisor.quote.savedEyebrow' | transloco }}</span>
          <h2>{{ 'advisor.quote.savedTitle' | transloco }}</h2>
          <p>{{ 'advisor.quote.savedBody' | transloco: { id: facade.savedQuote()!.id } }}</p>
          <span class="status" [class]="'status ' + facade.savedQuote()!.status">{{
            'advisor.status.' + facade.savedQuote()!.status | transloco
          }}</span>
        </div>
        <div class="advisor-result-actions">
          <button
            class="button primary"
            type="button"
            (click)="continueSubscription()"
            [disabled]="!facade.savedQuote()!.consentRecorded || updating()"
          >
            {{ 'advisor.quote.continueSubscription' | transloco }}
          </button>
          <button
            class="button secondary"
            type="button"
            (click)="sendToClient()"
            [disabled]="updating()"
          >
            {{ 'advisor.quote.sendToClient' | transloco }}
          </button>
          <a class="text-link-icon" routerLink="/advisor/quotes">{{
            'advisor.quotes.viewAll' | transloco
          }}</a>
        </div>
      </section>
    }
  </section>`,
})
export class AssistedQuotePage {
  readonly facade = inject(AdvisorFacade);
  private readonly fb = inject(FormBuilder);
  readonly saving = signal(false);
  readonly updating = signal(false);
  readonly saveError = signal(false);
  readonly consentForm = this.fb.nonNullable.group({
    recorded: [false],
    channel: ['clientPortal' as ConsentChannel],
  });

  calculate(request: TravelQuoteRequest): void {
    this.facade.calculatePlans(request.details);
  }

  retryPlans(): void {
    const details = this.facade.travelDetails();
    if (details) this.facade.calculatePlans(details);
  }

  selectPlan(plan: TravelPlan): void {
    this.facade.choosePlan(plan);
  }

  save(): void {
    this.saving.set(true);
    this.saveError.set(false);
    const { recorded, channel } = this.consentForm.getRawValue();
    this.facade.saveQuote(recorded, channel).subscribe({
      next: () => this.saving.set(false),
      error: () => {
        this.saving.set(false);
        this.saveError.set(true);
      },
    });
  }

  continueSubscription(): void {
    this.updateStatus('readyToSubscribe');
  }

  sendToClient(): void {
    this.updateStatus('sentToClient');
  }

  private updateStatus(status: AssistedQuoteStatus): void {
    this.updating.set(true);
    this.saveError.set(false);
    this.facade.updateSavedQuoteStatus(status).subscribe({
      next: () => this.updating.set(false),
      error: () => {
        this.updating.set(false);
        this.saveError.set(true);
      },
    });
  }
}

@Component({
  selector: 'app-assisted-quotes-page',
  imports: [
    TranslocoPipe,
    CopPipe,
    LocalDatePipe,
    SvgIconComponent,
    LoadingStateComponent,
    ErrorStateComponent,
  ],
  template: `<section class="page-stack">
    <div class="page-heading">
      <span class="eyebrow">{{ 'advisor.quotes.eyebrow' | transloco }}</span>
      <h1>{{ 'advisor.quotes.title' | transloco }}</h1>
      <p>{{ 'advisor.quotes.subtitle' | transloco }}</p>
    </div>
    @if (facade.quoteHistoryStatus() === 'loading') {
      <app-loading-state />
    } @else if (facade.quoteHistoryStatus() === 'error') {
      <app-error-state (retry)="facade.loadQuoteHistory()" />
    } @else if (facade.quoteHistoryStatus() === 'empty') {
      <div class="empty-state">
        <p>{{ 'advisor.quotes.empty' | transloco }}</p>
      </div>
    } @else {
      <div class="advisor-quote-list">
        @for (quote of facade.quotes(); track quote.id) {
          <article class="entity-card advisor-quote-card">
            <div class="entity-card-header">
              <span class="product-icon"><app-icon name="plane" [size]="21" /></span>
              <span class="status" [class]="'status ' + quote.status">{{
                'advisor.status.' + quote.status | transloco
              }}</span>
            </div>
            <h2>{{ quote.customerName }}</h2>
            <p>{{ quote.travelDetails.destination }} · {{ 'plans.' + quote.planId | transloco }}</p>
            <dl class="inline-details">
              <div>
                <dt>{{ 'common.amount' | transloco }}</dt>
                <dd>{{ quote.priceCop | cop }}</dd>
              </div>
              <div>
                <dt>{{ 'common.date' | transloco }}</dt>
                <dd>{{ quote.createdAt | localDate }}</dd>
              </div>
            </dl>
            <p class="advisor-audit-line">
              {{
                'advisor.quotes.audit'
                  | transloco: { advisor: quote.advisorName, customer: quote.customerName }
              }}
            </p>
          </article>
        }
      </div>
    }
  </section>`,
})
export class AssistedQuotesPage implements OnInit {
  readonly facade = inject(AdvisorFacade);

  ngOnInit(): void {
    this.facade.loadQuoteHistory();
  }
}
