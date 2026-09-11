import { Routes } from '@angular/router';
import {
  authGuard,
  guestGuard,
  issuedGuard,
  paymentGuard,
  planGuard,
  quoteGuard,
  registrationGuard,
} from './core/route.guards';
import { developmentRoutes } from './development.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        title: 'Solventa',
        loadComponent: () => import('./features/public/public.pages').then((m) => m.LandingPage),
      },
      {
        path: 'access',
        canActivate: [guestGuard],
        title: 'Solventa · Access',
        loadComponent: () => import('./features/auth/auth.pages').then((m) => m.LoginPage),
      },
      {
        path: 'recover-password',
        canActivate: [guestGuard],
        title: 'Solventa · Password recovery',
        loadComponent: () => import('./features/auth/auth.pages').then((m) => m.RecoveryPage),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        title: 'Solventa · Register',
        loadComponent: () => import('./features/auth/auth.pages').then((m) => m.RegisterPage),
      },
      {
        path: 'consent',
        canActivate: [registrationGuard],
        title: 'Solventa · Consents',
        loadComponent: () =>
          import('./features/onboarding/onboarding.pages').then((m) => m.ConsentPage),
      },
      {
        path: 'kyc',
        canActivate: [registrationGuard],
        title: 'Solventa · Identity verification',
        loadComponent: () =>
          import('./features/onboarding/onboarding.pages').then((m) => m.KycPage),
      },
      {
        path: 'help',
        title: 'Solventa · Help',
        loadComponent: () => import('./features/public/public.pages').then((m) => m.HelpPage),
      },
      {
        path: 'legal/terms',
        title: 'Solventa · Terms',
        loadComponent: () => import('./features/public/public.pages').then((m) => m.LegalPage),
      },
      {
        path: 'legal/privacy',
        title: 'Solventa · Privacy',
        loadComponent: () => import('./features/public/public.pages').then((m) => m.LegalPage),
      },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Solventa · Dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'quote',
        title: 'Solventa · Travel quote',
        loadComponent: () => import('./features/quote/quote.pages').then((m) => m.QuotePage),
      },
      {
        path: 'plans',
        canActivate: [quoteGuard],
        title: 'Solventa · Plans',
        loadComponent: () => import('./features/quote/quote.pages').then((m) => m.PlansPage),
      },
      {
        path: 'checkout',
        canActivate: [planGuard],
        title: 'Solventa · Checkout',
        loadComponent: () => import('./features/quote/quote.pages').then((m) => m.CheckoutPage),
      },
      {
        path: 'payment',
        canActivate: [planGuard],
        title: 'Solventa · Payment',
        loadComponent: () => import('./features/quote/quote.pages').then((m) => m.PaymentPage),
      },
      {
        path: 'otp',
        canActivate: [paymentGuard],
        title: 'Solventa · OTP',
        loadComponent: () => import('./features/quote/quote.pages').then((m) => m.OtpPage),
      },
      {
        path: 'issued',
        canActivate: [issuedGuard],
        title: 'Solventa · Issued policy',
        loadComponent: () => import('./features/quote/quote.pages').then((m) => m.IssuedPage),
      },
      {
        path: 'policies',
        title: 'Solventa · Policies',
        loadComponent: () => import('./features/policies/policy.pages').then((m) => m.PoliciesPage),
      },
      {
        path: 'policies/:id',
        title: 'Solventa · Policy',
        loadComponent: () =>
          import('./features/policies/policy.pages').then((m) => m.PolicyDetailPage),
      },
      {
        path: 'claims',
        title: 'Solventa · Claims',
        loadComponent: () => import('./features/claims/claim.pages').then((m) => m.ClaimsPage),
      },
      {
        path: 'claims/new',
        title: 'Solventa · New claim',
        loadComponent: () => import('./features/claims/claim.pages').then((m) => m.NewClaimPage),
      },
      {
        path: 'claims/:id',
        title: 'Solventa · Claim',
        loadComponent: () => import('./features/claims/claim.pages').then((m) => m.ClaimDetailPage),
      },
      {
        path: 'payments',
        title: 'Solventa · Payments',
        loadComponent: () => import('./features/account/account.pages').then((m) => m.PaymentsPage),
      },
      {
        path: 'notifications',
        title: 'Solventa · Notifications',
        loadComponent: () =>
          import('./features/account/account.pages').then((m) => m.NotificationsPage),
      },
      {
        path: 'profile',
        title: 'Solventa · Profile',
        loadComponent: () => import('./features/account/account.pages').then((m) => m.ProfilePage),
      },
      {
        path: 'settings',
        title: 'Solventa · Settings',
        loadComponent: () => import('./features/account/account.pages').then((m) => m.SettingsPage),
      },
      {
        path: 'help',
        title: 'Solventa · Help',
        loadComponent: () => import('./features/public/public.pages').then((m) => m.HelpPage),
      },
      ...developmentRoutes,
    ],
  },
  {
    path: '**',
    title: 'Solventa · Not found',
    loadComponent: () => import('./features/public/public.pages').then((m) => m.NotFoundPage),
  },
];
