import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockAuthenticationRepository } from '../data-access/mock/mock.repositories';
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
import { TestScenarioService } from '../testing/test-scenario.service';
import { AppStore } from './app-store.service';

describe('AppStore sessions', () => {
  let store: AppStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AppStore,
        TestScenarioService,
        MockAuthenticationRepository,
        { provide: AUTHENTICATION_REPOSITORY, useExisting: MockAuthenticationRepository },
        { provide: CUSTOMER_REPOSITORY, useValue: {} },
        { provide: CONSENT_REPOSITORY, useValue: {} },
        { provide: QUOTE_REPOSITORY, useValue: {} },
        { provide: POLICY_REPOSITORY, useValue: {} },
        { provide: CLAIM_REPOSITORY, useValue: {} },
        { provide: PAYMENT_REPOSITORY, useValue: {} },
        { provide: NOTIFICATION_REPOSITORY, useValue: {} },
      ],
    });
    store = TestBed.inject(AppStore);
  });

  it('preserves the existing client portal session', async () => {
    await firstValueFrom(store.login('demo@solventa.co', 'Solventa123'));
    expect(store.role()).toBe('CLIENT');
    expect(store.customer()?.fullName).toBe('Valentina Gómez');
    expect(store.advisor()).toBeNull();
  });

  it('creates a separate advisor session', async () => {
    await firstValueFrom(store.login('asesor@solventa.co', 'Solventa123'));
    expect(store.role()).toBe('ADVISOR');
    expect(store.advisor()?.fullName).toBe('Laura Martínez');
    expect(store.customer()).toBeNull();
  });
});
