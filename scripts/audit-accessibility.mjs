import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright-core';

const baseUrl = process.env['SOLVENTA_AUDIT_URL'] ?? 'http://localhost:4200';
const appUrl = `${baseUrl.replace(/\/$/, '')}/#`;
const chromePath =
  process.env['CHROME_PATH'] ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const customer = {
  id: 'customer-demo',
  fullName: 'Valentina Gómez',
  email: 'demo@solventa.co',
  documentNumber: '1020304050',
  kycStatus: 'approved',
};

const advisor = {
  id: 'advisor-demo',
  fullName: 'Laura Martínez',
  email: 'asesor@solventa.co',
  role: 'ADVISOR',
};

const advisorCustomerContext = {
  id: customer.id,
  fullName: customer.fullName,
};

const quote = {
  destination: 'España',
  departureDate: '2026-10-04',
  returnDate: '2026-10-19',
  travelers: 1,
};

const publicRoutes = [
  '/',
  '/access',
  '/register',
  '/recover-password',
  '/help',
  '/legal/terms',
  '/legal/privacy',
];

const authenticatedRoutes = [
  '/app/dashboard',
  '/app/quote',
  '/app/policies',
  '/app/policies/SOL-TRV-2026-1842',
  '/app/claims',
  '/app/claims/new',
  '/app/claims/SIN-2026-0942',
  '/app/payments',
  '/app/notifications',
  '/app/profile',
  '/app/settings',
  '/app/help',
];

const advisorRoutes = [
  '/advisor/dashboard',
  '/advisor/clients',
  '/advisor/clients/customer-demo',
  '/advisor/quote',
  '/advisor/quotes',
];

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--disable-gpu'],
});

const findings = [];
let checks = 0;

try {
  for (const theme of ['light', 'dark']) {
    for (const persona of ['public', 'client', 'advisor']) {
      const context = await browser.newContext({
        colorScheme: theme,
        reducedMotion: 'reduce',
        viewport: { width: 1440, height: 1000 },
      });

      await context.addInitScript(
        ({
          selectedTheme,
          demoCustomer,
          demoAdvisor,
          demoQuote,
          advisorContext,
          activePersona,
        }) => {
          localStorage.setItem('solventa.theme', selectedTheme);
          localStorage.setItem('solventa.language', 'es');
          if (activePersona === 'client') {
            sessionStorage.setItem(
              'solventa.demo.session',
              JSON.stringify({ role: 'CLIENT', profile: demoCustomer }),
            );
            sessionStorage.setItem('solventa.demo.quote', JSON.stringify(demoQuote));
          } else if (activePersona === 'advisor') {
            sessionStorage.setItem(
              'solventa.demo.session',
              JSON.stringify({ role: 'ADVISOR', profile: demoAdvisor }),
            );
            sessionStorage.setItem(
              'solventa.advisor.client-context',
              JSON.stringify(advisorContext),
            );
          } else {
            sessionStorage.removeItem('solventa.demo.session');
            sessionStorage.removeItem('solventa.demo.quote');
            sessionStorage.removeItem('solventa.advisor.client-context');
          }
        },
        {
          selectedTheme: theme,
          demoCustomer: customer,
          demoAdvisor: advisor,
          demoQuote: quote,
          advisorContext: advisorCustomerContext,
          activePersona: persona,
        },
      );

      const page = await context.newPage();
      const routes =
        persona === 'client'
          ? authenticatedRoutes
          : persona === 'advisor'
            ? advisorRoutes
            : publicRoutes;

      for (const route of routes) {
        await page.goto(`${appUrl}${route}`, { waitUntil: 'networkidle' });
        await page.locator('body').waitFor({ state: 'visible' });
        await page.waitForTimeout(550);
        checks += 1;

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();

        for (const violation of results.violations) {
          findings.push({
            theme,
            route,
            id: violation.id,
            impact: violation.impact,
            description: violation.help,
            targets: violation.nodes.flatMap((node) => node.target.map(String)),
          });
        }
      }

      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (findings.length === 0) {
  console.log(`Accessibility audit passed: ${checks} route/theme checks, 0 WCAG A/AA violations.`);
} else {
  console.error(JSON.stringify(findings, null, 2));
  process.exitCode = 1;
}
