# Architecture

## Technical baseline

- Angular 22 with standalone components, signals, reactive forms, and lazy routes
- TypeScript with strict compiler settings
- Transloco dictionaries in `public/i18n`
- Native `Intl` formatters exposed through small application pipes
- SCSS design tokens for color, spacing, elevation, responsive behavior, and themes
- Vitest through the Angular test builder

## Application layers

`features` contains the client and advisor page-level journeys. `layout` contains the public frame plus separate client and advisor shells. `core` coordinates role-aware sessions, state, guards, the advisor facade, theme, and localized titles. `data-access` defines repository contracts and supplies mock implementations. `shared` contains reusable presentation components and formatters, including the travel details and plan comparison surfaces used by both roles.

Pages depend on injection tokens rather than mock classes. A future API adapter can therefore replace each mock repository without changing feature components.

## State and persistence

`AppStore` is the orchestration boundary for authentication and the client portal. Its session is a discriminated `CLIENT | ADVISOR` model. `AdvisorFacade` owns the selected-client context, portfolio state, assisted quote flow, and quote traceability. Browser storage is limited to session, selected advisor context, in-progress client quote data, language, and theme preferences.

## Internationalization

All interface labels come from the Spanish and English Transloco dictionaries. Locale-aware pipes delegate display formatting to `Intl.DateTimeFormat` and `Intl.NumberFormat`, using the active application language.

## Mock behavior

Repositories return RxJS observables with realistic delays and deterministic records. Separate advisor customer and assisted quote contracts keep the screens independent from their mock implementations and ready for future HTTP adapters. `TestScenarioService` switches data and failures for review. Its route is supplied through a development-only route file that Angular replaces with an empty production module.

## Security boundary

Role guards isolate `/app` client routes from `/advisor` routes. The advisor can record consent supplied directly by a client but cannot grant it on the client's behalf, process payment, issue policies, approve claims, or access operations and partner administration. Authentication, KYC, payment, OTP, documents, and policy issuance are demonstrations only. No secret, payment credential, identity document, or regulated decision is processed or stored.
