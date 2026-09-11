# Week 6 Delivery Plan

## Objective

Deliver a coherent, responsive web prototype that demonstrates the complete Solventa customer journey without depending on a backend or external services.

## Required journey

1. A visitor reviews the product proposition and signs in or creates an account.
2. A new customer accepts consent and completes simplified identity verification.
3. The customer reaches the dashboard and starts a travel insurance quote.
4. The customer enters trip details, compares three plans, and selects one.
5. The customer confirms the purchase, completes a simulated card payment, and enters an OTP.
6. Solventa issues a mock policy and exposes it in the policy area.
7. The customer reports a claim and reviews its resulting status.
8. The customer can inspect notifications, payments, profile, preferences, and help.

## Cross-cutting requirements

- Spanish is the default language and English is available throughout the interface.
- Transloco owns interface copy; `Intl` owns dates, currencies, and numbers.
- Layouts support desktop, tablet, and mobile viewports.
- Semantic HTML, visible keyboard focus, contrast-aware themes, reduced-motion support, and useful status announcements cover the accessibility baseline.
- Repository contracts isolate screens from deterministic mock data.
- Loading, empty, success, error, slow-network, session-expired, rejected-payment, unavailable-quote, and claim-result scenarios are available for review.
- Development helpers do not ship in the production bundle.

## Acceptance criteria

- The required journey is navigable from the landing page to policy issuance and claim submission.
- Refreshing a route keeps only the small amount of session state needed for a usable prototype.
- Both languages render without broken translation keys.
- Primary actions remain usable at 390 px viewport width and with keyboard navigation.
- Unit tests pass and both development and production builds compile.

## Explicitly deferred

Advanced account recovery, complete legal copy, formal receipts, complex filtering, extensive claim timelines, production-grade persistence, real integrations, and a larger end-to-end automation suite must not block this delivery.
