# Cardano Ambassadors Brand Guide

This document captures all branding elements, design tokens, and visual patterns from the client application. Use this as a reference when rebuilding or maintaining the UI.

## Brand Assets

All brand assets are stored in the `/assets/` folder:

| Asset | Path | Description |
|-------|------|-------------|
| Logo | `assets/ambassadors-red.svg` | Primary wordmark with Cardano decorative elements |
| Fonts | `assets/fonts/` | Chivo font family (20 files, weights 100-900) |
| Onboarding | `assets/images/onboarding.png` | Onboarding visual |

## Brand Identity

### Primary Color
- **Brand Red**: `#FF5554` / `oklch(0.6821 0.2064 24.74)`
- Used in: Logo, primary buttons, links, accents, focus rings

### Logo Usage
- SVG format, 181x54 viewBox
- Responsive sizing: 120px (mobile) to 181px (desktop)
- Contains "AMBASSADORS" wordmark with Cardano decorative pattern
- Single color: Brand Red (#FF5554)

---

## Color System

### Design Tokens (CSS Variables)

#### Light Mode

| Token | OKLCH | HEX (approx) | Usage |
|-------|-------|--------------|-------|
| `--background` | `oklch(1 0 0)` | `#FFFFFF` | Page background |
| `--foreground` | `oklch(0.2739 0.0055 286.03)` | `#353945` | Primary text |
| `--muted` | `oklch(0.9819 0.0029 264.54)` | `#F7F8FA` | Disabled backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` | `#808080` | Secondary text |
| `--border` | `oklch(0.928 0.006 264.531)` | `#E6E8EC` | Borders, dividers |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Card backgrounds |
| `--card-foreground` | `oklch(0.4631 0.0013 197.11)` | `#606873` | Card text |
| `--input` | `oklch(1 0 0)` | `#FFFFFF` | Input backgrounds |
| `--primary` | `oklch(0.6821 0.2064 24.74)` | `#FF5554` | Primary actions |
| `--accent` | `oklch(0.7043 0.1873 23.55)` | `#FF7066` | Accent/hover states |
| `--ring` | `oklch(0.6821 0.2064 24.74)` | `#FF5554` | Focus rings |
| `--neutral` | `oklch(0.2046 0 0)` | `#2D2D2D` | Dark neutral |
| `--color-text-default` | `oklch(0.18 0.0032 196.87)` | `#1F2128` | Default text |
| `--color-text-light` | `oklch(0.5478 0.0012 197.12)` | `#777E90` | Light text |

#### Dark Mode

| Token | OKLCH | HEX (approx) | Usage |
|-------|-------|--------------|-------|
| `--background` | `oklch(0.283 0.0029 196.99)` | `#353945` | Page background |
| `--foreground` | `oklch(1 0 0)` | `#FFFFFF` | Primary text |
| `--muted` | `oklch(0.3743 0.0014 197.1)` | `#4A4F5C` | Disabled backgrounds |
| `--muted-foreground` | `oklch(0.7818 0.0011 197.13)` | `#B1B5C3` | Secondary text |
| `--border` | `oklch(0.4631 0.0013 197.11)` | `#606873` | Borders |
| `--card` | `oklch(0.283 0.0029 196.99)` | `#353945` | Card backgrounds |
| `--card-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Card text |
| `--input` | `oklch(0.3743 0.0014 197.1)` | `#4A4F5C` | Input backgrounds |
| `--neutral` | `oklch(0.709 0.01 56.259)` | `#B1A690` | Light neutral |
| `--color-text-default` | `oklch(1 0 0)` | `#FFFFFF` | Default text |

### Color Scales

#### Primary Scale (Orange-Red)

| Name | OKLCH | HEX (approx) |
|------|-------|--------------|
| `primary-50` | `oklch(0.8208 0.100577 19.4501)` | `#FFC5B8` |
| `primary-100` | `oklch(0.7882 0.1227 20.8)` | `#FFA899` |
| `primary-200` | `oklch(0.7578 0.1448 21.56)` | `#FF8D7D` |
| `primary-300` | `oklch(0.7297 0.1665 22.49)` | `#FF7568` |
| `primary-400` | `oklch(0.7043 0.1873 23.55)` | `#FF7066` |
| `primary-base` | `oklch(0.6821 0.2064 24.74)` | `#FF5554` |

#### Black Scale (Neutral Dark)

| Name | OKLCH | HEX (approx) |
|------|-------|--------------|
| `black-50` | `oklch(0.6292 0.0012 197.13)` | `#8B909F` |
| `black-100` | `oklch(0.5478 0.0012 197.12)` | `#777E90` |
| `black-200` | `oklch(0.4631 0.0013 197.11)` | `#606873` |
| `black-300` | `oklch(0.3743 0.0014 197.1)` | `#4A4F5C` |
| `black-400` | `oklch(0.283 0.0029 196.99)` | `#353945` |
| `black-500` | `oklch(0.18 0.0032 196.87)` | `#1F2128` |

#### White Scale (Neutral Light)

| Name | OKLCH | HEX (approx) |
|------|-------|--------------|
| `white-50` | `oklch(0.6292 0.0012 197.13)` | `#8B909F` |
| `white-100` | `oklch(0.7049 0.0012 197.13)` | `#A0A5B1` |
| `white-200` | `oklch(0.7818 0.0011 197.13)` | `#B1B5C3` |
| `white-300` | `oklch(0.8568 0.0011 197.14)` | `#D4D7DE` |
| `white-400` | `oklch(0.928 0 0)` | `#E6E8EC` |
| `white` | `oklch(1 0 0)` | `#FFFFFF` |

---

## Typography

### Font Family

**Primary Font**: Chivo
- **Fallback**: `ui-sans-serif, system-ui, sans-serif`
- **CSS Variable**: `--font-family-sans: 'Chivo', ui-sans-serif, system-ui, sans-serif`

### Font Files

Located in `assets/fonts/`:

| Weight | Normal | Italic |
|--------|--------|--------|
| 100 Thin | `Chivo-Thin.ttf` | `Chivo-ThinItalic.ttf` |
| 200 ExtraLight | `Chivo-ExtraLight.ttf` | `Chivo-ExtraLightItalic.ttf` |
| 300 Light | `Chivo-Light.ttf` | `Chivo-LightItalic.ttf` |
| 400 Regular | `Chivo-Regular.ttf` | `Chivo-Italic.ttf` |
| 500 Medium | `Chivo-Medium.ttf` | `Chivo-MediumItalic.ttf` |
| 600 SemiBold | `Chivo-SemiBold.ttf` | `Chivo-SemiBoldItalic.ttf` |
| 700 Bold | `Chivo-Bold.ttf` | `Chivo-BoldItalic.ttf` |
| 800 ExtraBold | `Chivo-ExtraBold.ttf` | `Chivo-ExtraBoldItalic.ttf` |
| 900 Black | `Chivo-Black.ttf` | `Chivo-BlackItalic.ttf` |

Variable fonts: `Chivo-VariableFont_wght.ttf`, `Chivo-Italic-VariableFont_wght.ttf`

### Heading Scale (Responsive)

| Level | Mobile | Tablet (sm) | Desktop (lg) |
|-------|--------|-------------|--------------|
| H1 | `48px/52px` | `56px/60px` | `72px/68px` |
| H2 | `32px/36px` | `40px/44px` | `48px/52px` |
| H3 | `28px/32px` | `36px/40px` | `44px/52px` |
| H4 | `24px/28px` | `32px/36px` | `40px/44px` |
| H5 | `20px/24px` | `24px/28px` | `32px/40px` |
| H6 | `16px/20px` | `18px/22px` | `20px/24px` |

All headings use `font-bold` (700).

### Paragraph Scale

| Size | Font Size | Weight | Line Height |
|------|-----------|--------|-------------|
| `xl` | 20px | Medium (500) | 30px |
| `lg` | 18px | Normal (400) | 28px |
| `base` | 16px | Normal (400) | 24px |
| `sm` | 14px | Normal (400) | 24px |
| `xs` | 12px | Normal (400) | 16px |

---

## Component Styling

### Button Variants

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| `primary` | `primary-base` | White | `primary-base` 2px | `primary-400` |
| `primary-light` | `primary-200` | White | — | `primary-400` |
| `secondary` | `primary-50` | `primary-base` | — | Opacity 80% |
| `outline` | Transparent | `primary-base` | `primary-base` 2px | `primary-50` bg |
| `ghost` | Transparent | `primary-base` | — | `muted` bg |
| `nav` | Transparent | Current color | — | Scale 1.05x |
| `warning` | `amber-500` | White | — | `amber-600` |
| `success` | `emerald-400` | White | — | `emerald-500` |

**Button Sizes**

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| `xs` | `8px 12px` | 14px | — |
| `sm` | `8px 16px` | 14px | — |
| `md` | `10px 20px` | 16px | — |
| `lg` | `12px 24px` | 18px | — |

**Border Radius**: `rounded-lg` (8px) or `rounded-full` (pill)

### Card Component

```
Background: var(--color-card)
Border: 1px solid var(--color-border)
Border Radius: rounded-xl (12px)
Shadow: 0px 3px 4px rgba(0,0,0,0.03)
Shadow (hover): 0px 3px 8px rgba(0,0,0,0.08)
```

**Padding Options**

| Size | Value |
|------|-------|
| `none` | 0 |
| `sm` | 16px (1rem) |
| `md` | 24px (1.5rem) |
| `lg` | 32px (2rem) |

### Chip/Badge Variants

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| `default` | `primary-50` | `primary-base` | `primary-base` |
| `success` | `emerald-50` | `emerald-600` | `emerald-600` |
| `inactive` | `gray-100` | `gray-600` | `gray-400` |
| `error` | `pink-50` | `pink-600` | `pink-600` |
| `warning` | `amber-50` | `amber-600` | `amber-600` |

**Border Radius**: `rounded-3xl` (24px)

### Input Fields

```
Background: var(--color-input)
Border: 1px solid var(--color-border)
Border (focus): primary-300 with 20% opacity
Border (error): red-500
Border Radius: rounded-lg (8px)
```

---

## Spacing & Layout

### Breakpoints

| Name | Value | Pixels |
|------|-------|--------|
| `sm` | 640px | (Tailwind default) |
| `md` | 768px | (Tailwind default) |
| `lg` | 74rem | 1184px |
| `xl` | 80rem | 1280px |
| `2xl` | 96rem | 1536px |

### Common Spacing Values

| Token | Rem | Pixels |
|-------|-----|--------|
| `1` | 0.25rem | 4px |
| `2` | 0.5rem | 8px |
| `3` | 0.75rem | 12px |
| `4` | 1rem | 16px |
| `5` | 1.25rem | 20px |
| `6` | 1.5rem | 24px |
| `8` | 2rem | 32px |
| `12` | 3rem | 48px |

---

## Border Radius

| Name | Value | Usage |
|------|-------|-------|
| `rounded-md` | 6px | Small elements, inputs |
| `rounded-lg` | 8px | Buttons, containers |
| `rounded-xl` | 12px | Cards (primary) |
| `rounded-3xl` | 24px | Chips, badges |
| `rounded-full` | 9999px | Pills, avatars |

---

## Shadows & Effects

### Box Shadows

| Name | Value | Usage |
|------|-------|-------|
| Card | `0px 3px 4px rgba(0,0,0,0.03)` | Default card elevation |
| Card Hover | `0px 3px 8px rgba(0,0,0,0.08)` | Interactive card hover |
| Chip | `0px 1px 2px rgba(13,13,18,0.06)` | Badge/chip elevation |
| Dropdown | `shadow-lg` (Tailwind) | Menus, tooltips |

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

### Backdrop Effects

- `backdrop-blur-sm` - Frosted glass effect for modals/dialogs

---

## Animations & Transitions

### Theme Transition

```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

Applied to `:root` and `.dark` for smooth theme switching.

### Component Durations

| Component | Duration | Easing |
|-----------|----------|--------|
| Buttons/Cards | 200ms | `ease-in-out` |
| Tab underline | 400ms | `ease-in-out` |
| Progress bars | 500ms | `ease-out` |
| Toast messages | 300ms | `ease-out` |
| Theme toggle | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |

### Interactive Transforms

| State | Transform |
|-------|-----------|
| Hover | `scale(1.02)` |
| Active/Pressed | `scale(0.98)` |
| Icon Hover | `scale(1.25)` |
| Stepper Hover | `scale(1.10)` |

### Framer Motion (Page Transitions)

```javascript
const variants = {
  enter: { x: direction > 0 ? 300 : -300, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: direction > 0 ? -300 : 300, opacity: 0 },
};
```

---

## Status Colors

| Status | Background | Text |
|--------|------------|------|
| Success | `emerald-400` / `green-500` | White |
| Warning | `amber-500` / `orange-500` | White |
| Error | `red-500` / `pink-600` | White |
| Info | `blue-500` | White |

---

## Icon Guidelines

- Default size: 24x24
- Color: Inherits from `currentColor` or explicit fill
- Theme toggle icons: `#777E91` (fixed gray)
- Loader glow: `drop-shadow(0 0 4px rgba(255, 85, 84, 0.2))`

---

## Implementation Notes

### Tailwind CSS 4
- Uses `@theme` block for design tokens
- OKLCH color space for perceptually uniform colors
- CSS variables enable instant theme switching

### Utility Function
```typescript
import { cn } from '@/utils/utils';
// Combines clsx + tailwind-merge for conditional styling
cn('base-class', condition && 'conditional-class')
```

### Theme Toggle
- Add `.dark` class to root element for dark mode
- All CSS variables swap automatically
- 300ms transition for smooth change
