# Solventa Design System

This document defines the shared design contract for Solventa Web and Solventa Mobile. Platform components may differ, but semantic roles, product language, and state behavior remain aligned.

## Typography

| Role    | Family               | Use                                                                      |
| ------- | -------------------- | ------------------------------------------------------------------------ |
| Display | Geologica Variable   | Brand, page titles, section titles, product names, and important metrics |
| Body    | Afacad Flux Variable | Body copy, labels, inputs, buttons, navigation, and metadata             |
| Code    | Platform monospace   | Optional technical and audit displays                                    |

Web uses responsive `rem` sizes. Android uses the Material 3 type scale in `sp`. Both platforms preserve the same role hierarchy and support user text scaling.

## Shared color contract

| Token            | Light     | Dark      | Meaning                                                          |
| ---------------- | --------- | --------- | ---------------------------------------------------------------- |
| `background`     | `#F7F9FC` | `#0B0F19` | Application background                                           |
| `surface`        | `#FFFFFF` | `#1E2640` | Cards and controls                                               |
| `surfaceVariant` | `#E8EEF6` | `#27324F` | Grouping and secondary containers                                |
| `textPrimary`    | `#0B1F3A` | `#FFFFFF` | Primary content                                                  |
| `textSecondary`  | `#475569` | `#CBD5E1` | Supporting content                                               |
| `primary`        | `#123B6D` | `#00D2FF` | Navigation and standard primary actions                          |
| `conversion`     | `#007FA3` | `#00D2FF` | High-value quote, purchase, issue, and urgent assistance actions |
| `success`        | `#047857` | `#10B981` | Completed and active states                                      |
| `warning`        | `#A44708` | `#F59E0B` | Pending, expiring, and review states                             |
| `error`          | `#B42318` | `#FF8A80` | Invalid, failed, rejected, and destructive states                |
| `outline`        | `#64748B` | `#71829C` | Main component border                                            |
| `outlineSoft`    | `#CBD5E1` | `#334155` | Dividers and subtle borders                                      |

Color never communicates state alone. Pair it with text, iconography, or accessible state descriptions.

## Spacing and size

Shared spacing values are `4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64`. Web exposes these as `--space-*` variables and Android maps the same values to density-independent pixels. Existing layouts may retain intermediate values until each component is migrated.

- Minimum interactive target: `48 × 48`.
- Radius roles: small, medium, large, and pill.
- Elevation roles: flat, raised, and overlay. Each platform implements elevation natively.

## Grid and layout

### Web

- Minimum supported width: `320px`.
- Compact breakpoint: `680px`.
- Navigation drawer breakpoint: `920px`.
- Wide adjustment: `1320px`.
- Public content width: `1180px` maximum.
- Authenticated content width: `1240px` maximum.
- Desktop navigation uses a `252px` sidebar.

### Android

- Phone portrait is the supported form factor for the prototype.
- Standard screen padding: `20dp` horizontal and `16dp` vertical.
- Standard content gap: `16dp`.
- Primary navigation uses five bottom destinations.
- Tablet, landscape, and foldable layouts remain outside the current scope.

## Component states

Interactive components support `default`, `focused`, `pressed`, `selected`, `disabled`, `loading`, and `invalid` where applicable. Hover is web-only. Android uses native Material ripple and focus behavior.

Repository-backed views support `initial`, `loading`, `content`, `empty`, `recoverableError`, and `success`. Empty states explain the absence of data and offer a useful action where possible. Recoverable errors provide retry. Forms support `initial`, `editing`, `invalid`, `submitting`, and `submitted`.

## Platform differences

- Web uses custom line icons; Android uses Material Rounded icons.
- Web uses side navigation and responsive grids; Android uses bottom navigation and vertical task flows.
- Web uses CSS shadows; Android uses Material tonal and shadow elevation.
- Web may use ambient 3D visuals; Android motion stays brief and functional.
- Date and file controls remain native to each platform.

These differences are intentional. Alignment means shared meaning and hierarchy, not identical controls.
