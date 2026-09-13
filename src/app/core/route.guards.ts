import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStore } from './app-store.service';
import { AdvisorFacade } from './advisor.facade';
import { homeRouteForRole } from './session-routing';
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
  if (!store.authenticated()) return true;
  return inject(Router).createUrlTree([homeRouteForRole(store.role())]);
};

export const clientGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  if (store.role() === 'CLIENT') return true;
  return inject(Router).createUrlTree([
    store.role() === 'ADVISOR' ? '/advisor/dashboard' : '/access',
  ]);
};

export const advisorGuard: CanActivateFn = () => {
  const store = inject(AppStore);
  if (store.role() === 'ADVISOR') return true;
  return inject(Router).createUrlTree([store.role() === 'CLIENT' ? '/app/dashboard' : '/access']);
};

export const advisorClientGuard: CanActivateFn = () => {
  const advisor = inject(AdvisorFacade);
  return advisor.selectedCustomer() !== null || inject(Router).createUrlTree(['/advisor/clients']);
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
