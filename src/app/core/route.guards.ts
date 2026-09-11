import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStore } from './app-store.service';
import { TestScenarioService } from '../testing/test-scenario.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(AppStore);
  const router = inject(Router);
  const scenarios = inject(TestScenarioService);
  if (scenarios.current() === 'sessionExpired') {
    scenarios.select('normal');
    store.logout();
    return router.createUrlTree(['/access'], {
      queryParams: { expired: '1', returnUrl: state.url },
    });
  }
  return (
    store.authenticated() ||
    router.createUrlTree(['/access'], { queryParams: { returnUrl: state.url } })
  );
};

export const guestGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  return !store.authenticated() || inject(Router).createUrlTree(['/app/dashboard']);
};

export const registrationGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  return store.registrationCustomer() !== null || inject(Router).createUrlTree(['/register']);
};

export const quoteGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  return store.travelDetails() !== null || inject(Router).createUrlTree(['/app/quote']);
};

export const planGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  return store.selectedPlan() !== null || inject(Router).createUrlTree(['/app/plans']);
};

export const paymentGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  return store.payment()?.status === 'approved' || inject(Router).createUrlTree(['/app/payment']);
};

export const issuedGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  return store.issuedPolicy() !== null || inject(Router).createUrlTree(['/app/otp']);
};
