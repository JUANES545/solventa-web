import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  MockAuthenticationRepository,
  MockPaymentRepository,
  PaymentRejectedError,
} from './mock.repositories';
import { TestScenarioService } from '../../testing/test-scenario.service';

describe('Mock repositories', () => {
  let scenarios: TestScenarioService;
  let auth: MockAuthenticationRepository;
  let payments: MockPaymentRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestScenarioService, MockAuthenticationRepository, MockPaymentRepository],
    });
    scenarios = TestBed.inject(TestScenarioService);
    auth = TestBed.inject(MockAuthenticationRepository);
    payments = TestBed.inject(MockPaymentRepository);
  });

  it('authenticates the fixed demo account', async () => {
    const customer = await firstValueFrom(auth.login('demo@solventa.co', 'Solventa123'));
    expect(customer.fullName).toBe('Valentina Gómez');
  });

  it('returns a deterministic rejected payment scenario', async () => {
    scenarios.select('paymentRejected');
    await expect(firstValueFrom(payments.pay(139900))).rejects.toBeInstanceOf(PaymentRejectedError);
  });
});
