---
name: SmartShift Design System
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1b1a'
  on-tertiary-container: '#868381'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c3'
  on-tertiary-fixed: '#1d1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  canvas: '#ffffff'
  surface-card: '#f5f5f5'
  surface-dark: '#101010'
  hairline: '#e5e7eb'
  success: '#10b981'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-md:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.04em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
---

## Overview
SmartShift's design system is built upon the Cal.com aesthetic — a clean, friendly modern-SaaS interface. It features a white canvas (`{colors.canvas}` — #ffffff) with black primary CTAs (`{colors.primary}` — #111111), and `{colors.surface-card}` (#f5f5f5) light-gray cards. The system is designed for clarity and ease of use, specifically tailored for small business owners in the service industry (cafes, restaurants, nail salons).

Type voice uses **Inter** for all UI elements (body, buttons, nav, captions) and a bold, geometric sans-serif for display headlines to mimic the "Cal Sans" feel (Inter weight 600 with negative letter-spacing -0.5px to -2px).

**Key Characteristics:**
- White canvas with black primary CTA (`{colors.primary}` — #111111). Buttons are `{rounded.md}` (8px).
- Display headlines use Inter 600 with negative letter-spacing for a modern, precise feel.
- Light-gray card surfaces (`{colors.surface-card}` — #f5f5f5) for forms and onboarding steps.
- Form inputs are clean with `{rounded.md}` (8px) corners and `{colors.hairline}` (#e5e7eb) borders.
- Footer and featured cards use `{colors.surface-dark}` (#101010).

## Colors
### Brand & Accent
- **Primary** (`{colors.primary}` — #111111): Primary CTAs and headlines.
- **Brand Accent** (`{colors.brand-accent}` — #3b82f6): Minimal use for links and highlights.
- **Success** (`{colors.success}` — #10b981): Confirmation and success states.
- **Error** (`{colors.error}` — #ef4444): Validation errors.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): Page background.
- **Surface Card** (`{colors.surface-card}` — #f5f5f5): Onboarding cards and form containers.
- **Surface Dark** (`{colors.surface-dark}` — #101010): Dark mode elements or featured sections.
- **Hairline** (`{colors.hairline}` — #e5e7eb): Input and divider lines.

## Typography
- **Display**: Inter, 600 weight, -0.04em letter-spacing (h1, h2, h3).
- **Body**: Inter, 400 weight (paragraphs, labels).
- **Button**: Inter, 600 weight, 14px.

## Shapes
- `{rounded.md}`: 8px (Buttons, Inputs).
- `{rounded.lg}`: 12px (Cards).
- `{rounded.full}`: 50% (Avatars).
