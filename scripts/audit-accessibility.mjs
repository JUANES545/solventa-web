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

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--disable-gpu'],
});

const findings = [];
let checks = 0;

try {
  for (const theme of ['light', 'dark']) {
    for (const authenticated of [false, true]) {
      const context = await browser.newContext({
        colorScheme: theme,
        reducedMotion: 'reduce',
        viewport: { width: 1440, height: 1000 },
      });

      await context.addInitScript(
        ({ selectedTheme, demoCustomer, demoQuote, hasSession }) => {
          localStorage.setItem('solventa.theme', selectedTheme);
          localStorage.setItem('solventa.language', 'es');
          if (hasSession) {
            sessionStorage.setItem('solventa.demo.session', JSON.stringify(demoCustomer));
            sessionStorage.setItem('solventa.demo.quote', JSON.stringify(demoQuote));
          } else {
            sessionStorage.removeItem('solventa.demo.session');
            sessionStorage.removeItem('solventa.demo.quote');
          }
        },
        {
          selectedTheme: theme,
          demoCustomer: customer,
          demoQuote: quote,
          hasSession: authenticated,
        },
      );

      const page = await context.newPage();
      const routes = authenticated ? authenticatedRoutes : publicRoutes;

      for (const route of routes) {
        await page.goto(`${appUrl}${route}`, { waitUntil: 'networkidle' });
        await page.locator('body').waitFor({ state: 'visible' });
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
