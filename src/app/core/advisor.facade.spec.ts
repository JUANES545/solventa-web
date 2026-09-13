import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  DEMO_ADVISOR,
  MockAdvisorCustomerRepository,
  MockAssistedQuoteRepository,
  MockQuoteRepository,
} from '../data-access/mock/mock.repositories';
import {
  ADVISOR_CUSTOMER_REPOSITORY,
  ASSISTED_QUOTE_REPOSITORY,
  QUOTE_REPOSITORY,
} from '../data-access/repository.tokens';
import { TestScenarioService } from '../testing/test-scenario.service';
import { AdvisorFacade } from './advisor.facade';
import { AppStore } from './app-store.service';

describe('AdvisorFacade', () => {
  let facade: AdvisorFacade;
  let scenarios: TestScenarioService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AdvisorFacade,
        TestScenarioService,
        MockAdvisorCustomerRepository,
        MockAssistedQuoteRepository,
        MockQuoteRepository,
        { provide: ADVISOR_CUSTOMER_REPOSITORY, useExisting: MockAdvisorCustomerRepository },
        { provide: ASSISTED_QUOTE_REPOSITORY, useExisting: MockAssistedQuoteRepository },
        { provide: QUOTE_REPOSITORY, useExisting: MockQuoteRepository },
        { provide: AppStore, useValue: { advisor: () => DEMO_ADVISOR } },
      ],
    });
    facade = TestBed.inject(AdvisorFacade);
    scenarios = TestBed.inject(TestScenarioService);
  });

  it('searches and selects a client', async () => {
    facade.loadCustomers('Valentina');
    expect(facade.customerListStatus()).toBe('loading');
    await waitForStatus(() => facade.customerListStatus() === 'success');

    expect(facade.customers()).toHaveLength(1);
    facade.selectCustomer(facade.customers()[0]);
    expect(facade.selectedCustomer()?.fullName).toBe('Valentina Gómez');
  });

  it('starts, saves, and hands off an assisted quote', async () => {
    facade.loadCustomers('Valentina');
    await waitForStatus(() => facade.customerListStatus() === 'success');
    facade.selectCustomer(facade.customers()[0]);
    facade.calculatePlans({
      destination: 'España',
      departureDate: '2026-10-04',
      returnDate: '2026-10-19',
      travelers: 1,
    });
    await waitForStatus(() => facade.plansStatus() === 'success');
    facade.choosePlan(facade.plans()[1]);

    const saved = await firstValueFrom(facade.saveQuote(true, 'clientPortal'));
    const handedOff = await firstValueFrom(facade.updateSavedQuoteStatus('sentToClient'));

    expect(saved.advisorId).toBe(DEMO_ADVISOR.id);
    expect(handedOff.status).toBe('sentToClient');
  });

  it('exposes loading, empty, and error states from mock repositories', async () => {
    scenarios.select('normal');
    facade.loadCustomers();
    expect(facade.customerListStatus()).toBe('loading');

    scenarios.select('empty');
    facade.loadCustomers();
    await waitForStatus(() => facade.customerListStatus() === 'empty');

    scenarios.select('networkError');
    facade.loadCustomers();
    await waitForStatus(() => facade.customerListStatus() === 'error');
  });

  async function waitForStatus(condition: () => boolean): Promise<void> {
    await vi.waitFor(() => expect(condition()).toBe(true), { timeout: 1500 });
  }
});
