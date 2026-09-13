import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { AdvisorFacade } from './advisor.facade';
import { AppStore } from './app-store.service';
import { advisorClientGuard, advisorGuard, clientGuard } from './route.guards';

describe('role guards', () => {
  const role = signal<'CLIENT' | 'ADVISOR' | null>(null);
  const selectedCustomer = signal<{ id: string; fullName: string } | null>(null);

  beforeEach(() => {
    role.set(null);
    selectedCustomer.set(null);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: { role } },
        { provide: AdvisorFacade, useValue: { selectedCustomer } },
      ],
    });
  });

  it('keeps clients out of advisor routes and advisors out of client routes', () => {
    role.set('CLIENT');
    const advisorResult = runGuard(advisorGuard);
    expect((advisorResult as UrlTree).toString()).toBe('/app/dashboard');

    role.set('ADVISOR');
    const clientResult = runGuard(clientGuard);
    expect((clientResult as UrlTree).toString()).toBe('/advisor/dashboard');
  });

  it('allows only advisors with a selected customer to open assisted quotes', () => {
    expect((runGuard(advisorClientGuard) as UrlTree).toString()).toBe('/advisor/clients');
    selectedCustomer.set({ id: 'customer-demo', fullName: 'Valentina Gómez' });
    expect(runGuard(advisorClientGuard)).toBe(true);
  });

  function runGuard(guard: typeof advisorGuard): unknown {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }
});
