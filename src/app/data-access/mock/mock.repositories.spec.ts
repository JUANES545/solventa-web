import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  MockAdvisorCustomerRepository,
  MockAssistedQuoteRepository,
  MockAuthenticationRepository,
  MockPaymentRepository,
  PaymentRejectedError,
} from './mock.repositories';
import { TestScenarioService } from '../../testing/test-scenario.service';

describe('Mock repositories', () => {
  let scenarios: TestScenarioService;
  let auth: MockAuthenticationRepository;
  let payments: MockPaymentRepository;
  let advisorCustomers: MockAdvisorCustomerRepository;
  let assistedQuotes: MockAssistedQuoteRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestScenarioService,
        MockAuthenticationRepository,
        MockPaymentRepository,
        MockAdvisorCustomerRepository,
        MockAssistedQuoteRepository,
      ],
    });
    scenarios = TestBed.inject(TestScenarioService);
    auth = TestBed.inject(MockAuthenticationRepository);
    payments = TestBed.inject(MockPaymentRepository);
    advisorCustomers = TestBed.inject(MockAdvisorCustomerRepository);
    assistedQuotes = TestBed.inject(MockAssistedQuoteRepository);
  });

  it('authenticates the fixed demo account', async () => {
    const session = await firstValueFrom(auth.login('demo@solventa.co', 'Solventa123'));
    expect(session.role).toBe('CLIENT');
    expect(session.profile.fullName).toBe('Valentina Gómez');
  });

  it('authenticates the advisor demo account', async () => {
    const session = await firstValueFrom(auth.login('asesor@solventa.co', 'Solventa123'));
    expect(session.role).toBe('ADVISOR');
    expect(session.profile.fullName).toBe('Laura Martínez');
  });

  it('searches advisor clients by name, document, or email', async () => {
    const byName = await firstValueFrom(advisorCustomers.search('valentina'));
    const byDocument = await firstValueFrom(advisorCustomers.search('1018427391'));
    const byEmail = await firstValueFrom(advisorCustomers.search('ana.torres@example.com'));

    expect(byName[0].fullName).toBe('Valentina Gómez');
    expect(byDocument[0].fullName).toBe('Mateo Restrepo');
    expect(byEmail[0].fullName).toBe('Ana Torres');
  });

  it('stores advisor and customer traceability in assisted quotes', async () => {
    const quote = await firstValueFrom(
      assistedQuotes.save({
        customerId: 'customer-demo',
        customerName: 'Valentina Gómez',
        advisorId: 'advisor-demo',
        advisorName: 'Laura Martínez',
        travelDetails: {
          destination: 'España',
          departureDate: '2026-10-04',
          returnDate: '2026-10-19',
          travelers: 1,
        },
        plan: {
          id: 'plus',
          priceCop: 139900,
          medicalCoverageCop: 150000000,
          baggageCoverageCop: 4000000,
          delayCoverageCop: 1000000,
        },
        consentRecorded: true,
        consentChannel: 'clientPortal',
      }),
    );

    expect(quote.advisorId).toBe('advisor-demo');
    expect(quote.customerId).toBe('customer-demo');
    expect(quote.status).toBe('active');
  });

  it('returns a deterministic rejected payment scenario', async () => {
    scenarios.select('paymentRejected');
    await expect(firstValueFrom(payments.pay(139900))).rejects.toBeInstanceOf(PaymentRejectedError);
  });
});
