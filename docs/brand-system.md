# Solventa Brand System

## Brand idea

The Solventa symbol combines a shield with an `S`. The shield represents protection and trust. The continuous `S` identifies Solventa without using a currency sign. One geometry is used across web, Android, documents, and design files.

## Master artwork

| Asset                                         | Use                                |
| --------------------------------------------- | ---------------------------------- |
| `public/brand/solventa-symbol.svg`            | Light backgrounds                  |
| `public/brand/solventa-symbol-dark.svg`       | Dark backgrounds                   |
| `public/brand/solventa-symbol-monochrome.svg` | Single-color documents and exports |

The symbol uses a `24 × 24` view box. Do not redraw or modify its proportions.

## Color variants

| Variant    | Shield                   | Letter                                |
| ---------- | ------------------------ | ------------------------------------- |
| Light      | Corporate Navy `#123B6D` | White `#FFFFFF`                       |
| Dark       | Electric Cyan `#00D2FF`  | Deep Ink `#001018`                    |
| Monochrome | Current foreground color | White or transparent background color |

## Wordmark

Set `Solventa` in Geologica Variable, weight `680`, with `-0.03em` letter spacing. Keep the wordmark separate from the symbol so layouts can use the symbol alone at compact sizes.

## Size and spacing

- Minimum digital symbol size: `16 px`.
- Standard web navigation size: `36 px`.
- Compact policy-card size: `25 px`.
- Clear space: at least one quarter of the symbol width on every side.
- Keep the original aspect ratio. Never stretch, rotate, outline, or add a shadow to the artwork.

## Accessibility

Treat the symbol as decorative when an adjacent `Solventa` wordmark or accessible link name is present. Symbol-only controls require an accessible name. Use only the approved light, dark, or monochrome pairings.

## Implementation

Web UI renders the shared `BrandMarkComponent`. Favicon and design exports use the SVG assets. Any new branded surface must reuse one of these sources instead of recreating the shield.
