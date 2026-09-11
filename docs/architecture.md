# Architecture

## Technical baseline

- Angular 22 with standalone components, signals, reactive forms, and lazy routes
- TypeScript with strict compiler settings
- Transloco dictionaries in `public/i18n`
- Native `Intl` formatters exposed through small application pipes
- SCSS design tokens for color, spacing, elevation, responsive behavior, and themes
- Vitest through the Angular test builder

## Application layers

`features` contains page-level journeys. `layout` contains the public frame and authenticated shell. `core` coordinates session, state, guards, theme, and localized titles. `data-access` defines repository contracts and supplies mock implementations. `shared` contains reusable presentation components and formatters.

Pages depend on injection tokens rather than mock classes. A future API adapter can therefore replace each mock repository without changing feature components.

## State and persistence

`AppStore` is the orchestration boundary for the prototype. It uses Angular signals for current customer, quote, selected plan, policy, claims, payments, and notifications. Browser storage is intentionally limited to session, onboarding completion, language, and theme preferences.

## Internationalization

All interface labels come from the Spanish and English Transloco dictionaries. Locale-aware pipes delegate display formatting to `Intl.DateTimeFormat` and `Intl.NumberFormat`, using the active application language.

## Mock behavior

Repositories return RxJS observables with realistic delays and deterministic records. `TestScenarioService` switches data and failures for review. Its route is supplied through a development-only route file that Angular replaces with an empty production module.

## Security boundary

Authentication, KYC, payment, OTP, documents, and policy issuance are demonstrations only. No secret, payment credential, identity document, or regulated decision is processed or stored.
