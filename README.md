# Solventa Web

Solventa Web is a responsive Angular prototype for a digital insurance experience. The Week 6 release focuses on one complete, navigable customer journey backed by deterministic mock repositories.

## Included flow

- Sign in or register, consent, and simplified KYC
- Dashboard and travel insurance quote
- Plan selection, simulated payment, and OTP verification
- Policy issuance, policy list, and policy detail
- Claim reporting and follow-up
- Notifications, payments, profile, settings, and help
- Spanish and English with Transloco and locale-aware `Intl` formatting
- Light, dark, and system themes with responsive and accessible layouts
- Development-only test scenarios for empty, error, slow, expired-session, and rejected-operation states

Demo credentials: `demo@solventa.co` / `Solventa123`  
Demo OTP: `123456`

## Live prototype

The stable release is published at [juanes545.github.io/solventa-web](https://juanes545.github.io/solventa-web/). GitHub Actions builds and deploys the application from `main` to GitHub Pages.

## Local setup

Requirements: Node.js 22 or later and pnpm 11.

```bash
pnpm install
pnpm start
```

Open `http://localhost:4200`. The development scenario panel is available at `/app/__dev/scenarios` after signing in and is excluded from production builds.

## Quality commands

```bash
pnpm test:ci
pnpm audit:a11y
pnpm build
pnpm build:dev
pnpm format:check
```

Run `pnpm audit:a11y` while the development server is available at `http://localhost:4200`. The audit checks the main public and authenticated routes in both light and dark themes with WCAG A/AA rules.

## Project notes

- [Week 6 delivery plan](docs/week-6-plan.md)
- [Architecture](docs/architecture.md)
- [Evolution plan](docs/evolution-plan.md)
- [Git workflow](docs/git-workflow.md)

This repository is an academic prototype. Payments, OTP delivery, policy issuance, downloads, and claim processing are simulated and must not be used as production insurance services.
