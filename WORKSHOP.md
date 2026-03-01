# Workshop: Modern Design System from Scratch

Build a production-quality, visually polished component library using only modern CSS -- no Sass, no CSS-in-JS, no frameworks. By the end, you will have a complete design system with a showcase page you can put in your portfolio.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [What You'll Learn](#what-youll-learn)
4. [File Structure](#file-structure)
5. [Part 1: Foundation -- Layers & Tokens](#part-1----foundation-layers--tokens)
6. [Part 2: Reset & Base Styles](#part-2----reset--base-styles)
7. [Part 3: Components](#part-3----components)
8. [Part 4: Dark Mode](#part-4----dark-mode)
9. [Part 5: Utilities & Accessibility](#part-5----utilities--accessibility)
10. [Part 6: Showcase Page](#part-6----showcase-page)
11. [Part 7: Wrap-Up & When NOT to Use These Features](#part-7----wrap-up--when-not-to-use-these-features)
12. [Final Solution](#final-solution)

---

## Overview

**Goal:** Build a complete design system with 12 components, a token system, dark mode, and a showcase page -- using only modern CSS features available in 2025+ browsers.

**Duration:** ~5-6 hours (with breaks)

---

## Prerequisites

- Basic CSS knowledge (selectors, box model, flexbox, grid)
- No preprocessor experience required
- A modern browser (Chrome 120+, Firefox 128+, Safari 17.4+)
- A code editor

---

## What You'll Learn

- CSS custom properties as design tokens
- `@layer` for cascade management (and why it eliminates specificity wars)
- Native CSS nesting (goodbye Sass)
- `oklch()` and `color-mix()` for perceptually uniform color palettes
- `@property` for typed, animatable custom properties
- Container queries for self-adapting components
- `:has()` for parent-aware styling (no JavaScript needed)
- `@scope` for style encapsulation (advanced)
- `@starting-style` for entry animations
- `prefers-reduced-motion` and `prefers-color-scheme`
- Logical properties for internationalization-ready CSS
- Dark mode via semantic token swapping
- Building a complete showcase page

---

## File Structure

```
design-system/
  index.html      -- Showcase page
  main.css        -- Layer ordering and imports
  tokens.css      -- Design tokens
  reset.css       -- Modern CSS reset
  components.css  -- All component styles
  utilities.css   -- Utility classes
  theme.js        -- Dark mode toggle with persistence
```

---

## Part 1 -- Foundation: Layers & Tokens

**Time: ~60 minutes**

### 1a. Understanding `@layer`

Before writing any styles, you need to understand cascade layers thoroughly.

**The problem:** In traditional CSS, specificity and source order determine which styles win. This causes constant conflicts -- a utility class like `.text-center` (specificity 0,1,0) loses to a component rule like `.card .card__title` (specificity 0,2,0), even though utilities should always win.

**The solution:** `@layer` lets you define an explicit priority order. Styles in later layers always beat styles in earlier layers, regardless of specificity.

```css
/* main.css -- this single line controls the entire cascade */
@layer tokens, reset, base, components, utilities;
```

This means:
- `utilities` beats `components` (always)
- `components` beats `base` (always)
- `base` beats `reset` (always)
- `reset` beats `tokens` (always)

**Critical gotcha:** Styles NOT inside any `@layer` beat ALL layered styles. Never write styles outside a layer in a system that uses layers.

**Exercise:** Create two conflicting rules where the "wrong" one wins due to specificity. Then wrap them in layers and show how the intended one wins.

```css
/* WITHOUT layers: .card .card__title beats .text-center */
.card .card__title { text-align: left; }   /* specificity 0,2,0 */
.text-center { text-align: center; }        /* specificity 0,1,0 -- LOSES */

/* WITH layers: utilities layer always beats components layer */
@layer components {
  .card .card__title { text-align: left; }  /* specificity doesn't matter */
}
@layer utilities {
  .text-center { text-align: center; }      /* WINS because utilities > components */
}
```

Now create the `main.css` file:

```css
/* main.css -- Layer ordering & imports */
@layer tokens, reset, base, components, utilities;

@import url("tokens.css");
@import url("reset.css");
@import url("components.css");
@import url("utilities.css");
```

### 1b. Design Tokens

Tokens are the atoms of the system. Every visual decision (color, spacing, font size, shadow, animation timing) is captured as a CSS custom property.

**`oklch()` color space:** Unlike `hsl()`, oklch is perceptually uniform -- a lightness of 50% actually looks medium-bright across all hues. This means programmatically generated tints and shades look correct.

**`color-mix()` function:** Generates a full palette from a single base color by mixing it with white (for tints) or black (for shades).

Create `tokens.css`:

```css
/* --- Typed Custom Properties (for animation) --- */

@property --btn-bg {
  syntax: "<color>";
  initial-value: transparent;
  inherits: false;
}

@property --progress-value {
  syntax: "<percentage>";
  initial-value: 0%;
  inherits: false;
}

@property --toggle-pos {
  syntax: "<length>";
  initial-value: 2px;
  inherits: false;
}
```

**Teaching point:** `@property` tells the browser the TYPE of a custom property. Without it, the browser sees `--btn-bg` as a string and cannot interpolate between values. With `@property`, the browser knows it is a `<color>` and can smoothly animate between two color values.

Now define the token categories inside `@layer tokens`:

```css
@layer tokens {
  :root {
    /* --- Primary palette --- */
    --color-primary: oklch(55% 0.25 260);
    --color-primary-light: oklch(70% 0.15 260);
    --color-primary-dark: oklch(40% 0.25 260);

    /* Generated tints (mix with white) and shades (mix with black) */
    --color-primary-50:  color-mix(in oklch, var(--color-primary) 8%, white);
    --color-primary-100: color-mix(in oklch, var(--color-primary) 16%, white);
    --color-primary-200: color-mix(in oklch, var(--color-primary) 32%, white);
    --color-primary-300: color-mix(in oklch, var(--color-primary) 50%, white);
    --color-primary-400: color-mix(in oklch, var(--color-primary) 75%, white);
    --color-primary-500: var(--color-primary);
    --color-primary-600: color-mix(in oklch, var(--color-primary) 85%, black);
    --color-primary-700: color-mix(in oklch, var(--color-primary) 65%, black);
    --color-primary-800: color-mix(in oklch, var(--color-primary) 45%, black);
    --color-primary-900: color-mix(in oklch, var(--color-primary) 25%, black);
```

**Exercise:** Change `--color-primary` to a different hue (try `oklch(55% 0.25 150)` for green) and watch the entire palette update automatically.

Token categories to build:

- **Colors**: primary palette (50-900 via color-mix), neutral palette, semantic colors (success, warning, error, info)
- **Semantic aliases**: text, surface, border tokens that map to raw colors (these are what dark mode swaps)
- **Typography**: font families, size scale (using `clamp()` for fluid sizing), line heights, font weights, letter spacing
- **Spacing**: consistent 4px-based scale from 0 to 24
- **Border radius**: xs through full
- **Shadows**: xs, sm, md, lg, xl, 2xl (adjusted for dark mode)
- **Z-index**: base, raised, dropdown, sticky, overlay, modal, toast, tooltip
- **Transitions**: duration scale (instant through slower), multiple easing curves, reduced-motion overrides
- **Focus ring**: consistent focus style token
- **Breakpoints**: as custom properties for reference
- **Border widths**: thin, medium, thick

Semantic color aliases (these are what dark mode swaps):

```css
    /* --- Semantic aliases --- */
    --text-primary:   var(--color-neutral-900);
    --text-secondary: var(--color-neutral-600);
    --text-muted:     var(--color-neutral-400);
    --text-inverse:   var(--color-neutral-0);

    --surface-page:    var(--color-neutral-0);
    --surface-raised:  var(--color-neutral-0);
    --surface-sunken:  var(--color-neutral-50);
    --surface-overlay: var(--color-neutral-0);

    --border-default: var(--color-neutral-200);
    --border-strong:  var(--color-neutral-400);
    --border-focus:   var(--color-primary);
```

Fluid typography using `clamp()`:

```css
    /* Fluid type scale -- smoothly scales between viewport sizes */
    --text-xs:   clamp(0.7rem, 0.66rem + 0.2vw, 0.75rem);
    --text-sm:   clamp(0.8rem, 0.76rem + 0.2vw, 0.875rem);
    --text-base: clamp(0.938rem, 0.9rem + 0.2vw, 1rem);
    --text-lg:   clamp(1.063rem, 1rem + 0.3vw, 1.125rem);
    --text-xl:   clamp(1.2rem, 1.1rem + 0.5vw, 1.375rem);
    --text-2xl:  clamp(1.4rem, 1.2rem + 1vw, 1.75rem);
    --text-3xl:  clamp(1.7rem, 1.4rem + 1.5vw, 2.25rem);
    --text-4xl:  clamp(2rem, 1.6rem + 2vw, 3rem);
```

**Teaching point:** `clamp(min, preferred, max)` eliminates breakpoints for typography. The font smoothly scales with the viewport, but never goes below min or above max.

Transition tokens with reduced motion:

```css
    /* --- Transitions & Animation --- */
    --duration-instant: 50ms;
    --duration-fast:    100ms;
    --duration-normal:  200ms;
    --duration-slow:    300ms;
    --duration-slower:  500ms;

    --ease-default: cubic-bezier(0.4, 0, 0.2, 1);    /* general purpose  */
    --ease-in:      cubic-bezier(0.4, 0, 1, 1);       /* exits            */
    --ease-out:     cubic-bezier(0, 0, 0.2, 1);       /* entrances        */
    --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);     /* state changes    */
    --ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);/* playful spring   */
```

Reduced motion overrides (still inside `@layer tokens`):

```css
  @media (prefers-reduced-motion: reduce) {
    :root {
      --duration-instant: 0ms;
      --duration-fast:    0ms;
      --duration-normal:  0ms;
      --duration-slow:    0ms;
      --duration-slower:  0ms;
    }
  }
```

**Teaching point:** By zeroing out duration tokens, every component that uses them automatically respects reduced motion. No per-component `@media` queries needed.

---

## Part 2 -- Reset & Base Styles

**Time: ~20 minutes**

Build a modern CSS reset in `reset.css`. Explain each rule:

```css
@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
```

- `box-sizing: border-box` on everything -- padding and border are included in total width/height
- `margin: 0` -- intentional spacing via tokens, not browser defaults

```css
  html {
    color-scheme: light dark;
    hanging-punctuation: first last;
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
```

- `color-scheme: light dark` tells the browser the page supports both themes (affects form controls, scrollbars)
- `hanging-punctuation: first last` moves quotes/periods outside the text box for cleaner alignment
- Smooth scrolling, but only if user has not requested reduced motion

```css
  body {
    min-block-size: 100dvh;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    color: var(--text-primary);
    background-color: var(--surface-page);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
```

- `min-block-size: 100dvh` -- `dvh` accounts for mobile browser chrome (URL bar, bottom bar) unlike plain `vh`
- Logical properties: `block-size` = height in horizontal writing modes, `inline-size` = width

```css
  img, picture, video, canvas, svg {
    display: block;
    max-inline-size: 100%;
    block-size: auto;
  }

  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    text-wrap: balance;
    line-height: var(--leading-tight);
  }

  p {
    text-wrap: pretty;
  }
```

- `text-wrap: balance` distributes text evenly across lines in headings
- `text-wrap: pretty` avoids orphans (single words on the last line) in paragraphs

```css
  :focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  :focus:not(:focus-visible) {
    outline: none;
  }
```

- Show focus ring only for keyboard navigation, not for mouse clicks

---

## Part 3 -- Components

**Time: ~150 minutes**

Build each component incrementally. Start with the simplest and build toward the most complex. All components go in `components.css` inside `@layer components { ... }`.

### Component 1: Badge (15 min)

Warm-up. Uses tokens and nesting only. Multiple variants. Introduces `color-mix()` for semi-transparent backgrounds.

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding-block: var(--space-0_5);
  padding-inline: var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  white-space: nowrap;
  border: var(--border-thin) solid transparent;

  /* --- Variants --- */
  &.badge--neutral {
    background: var(--surface-sunken);
    color: var(--text-secondary);
    border-color: var(--border-default);
  }

  &.badge--primary {
    background: color-mix(in oklch, var(--color-primary) 12%, transparent);
    color: var(--color-primary);
    border-color: color-mix(in oklch, var(--color-primary) 25%, transparent);
  }

  &.badge--success {
    background: color-mix(in oklch, var(--color-success) 12%, transparent);
    color: var(--color-success);
    border-color: color-mix(in oklch, var(--color-success) 25%, transparent);
  }
  /* ... warning, error, info variants follow the same pattern */

  /* --- Sizes --- */
  &.badge--lg {
    padding-block: var(--space-1);
    padding-inline: var(--space-3);
    font-size: var(--text-sm);
  }

  /* --- Dot indicator --- */
  &.badge--dot::before {
    content: "";
    inline-size: 6px;
    block-size: 6px;
    border-radius: var(--radius-full);
    background: currentColor;
  }
}
```

**Teaching point:** Native CSS nesting with `&` works just like Sass. `color-mix(in oklch, var(--color-primary) 12%, transparent)` creates a semi-transparent tint using the oklch color space.

**Exercise:** Add a `badge--outline` variant that uses a transparent background with a colored border.

### Component 2: Button (20 min)

Introduces `@property` for animatable custom properties. Four variants (primary, secondary, outline, ghost). Three sizes. Disabled and loading states.

```css
.btn {
  --btn-bg: var(--color-primary);
  --btn-color: var(--text-inverse);
  --btn-border: transparent;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding-block: var(--space-2);
  padding-inline: var(--space-4);
  border: var(--border-thin) solid var(--btn-border);
  border-radius: var(--radius-md);
  background: var(--btn-bg);
  color: var(--btn-color);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition:
    --btn-bg var(--duration-normal) var(--ease-default),
    border-color var(--duration-normal) var(--ease-default),
    box-shadow var(--duration-normal) var(--ease-default);

  &:hover {
    --btn-bg: var(--color-primary-dark);
  }

  &:active {
    transform: scale(0.98);
  }
```

**Teaching point:** Because `--btn-bg` is registered with `@property` as `<color>`, the browser can smoothly interpolate between the default and hover colors. Without `@property`, the transition on `--btn-bg` would be an instant swap.

Variants use the same custom properties:

```css
  &.btn--secondary {
    --btn-bg: var(--surface-sunken);
    --btn-color: var(--text-primary);
    --btn-border: var(--border-default);

    &:hover {
      --btn-bg: var(--color-neutral-200);
      --btn-border: var(--border-strong);
    }
  }

  &.btn--outline {
    --btn-bg: transparent;
    --btn-color: var(--color-primary);
    --btn-border: var(--color-primary);

    &:hover {
      --btn-bg: var(--color-primary-50);
    }
  }

  &.btn--ghost {
    --btn-bg: transparent;
    --btn-color: var(--color-primary);
    --btn-border: transparent;

    &:hover {
      --btn-bg: var(--color-primary-50);
    }
  }
```

Loading state with spinner:

```css
  &.btn--loading {
    color: transparent;
    pointer-events: none;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      margin: auto;
      inline-size: 1em;
      block-size: 1em;
      border: 2px solid currentColor;
      border-color: var(--text-inverse) transparent var(--text-inverse) transparent;
      border-radius: var(--radius-full);
      animation: btn-spin 0.6s linear infinite;
    }
  }
}

@keyframes btn-spin {
  to { rotate: 360deg; }
}
```

**Exercise:** Add a `btn--danger` variant with `--color-error` as the background.

### Component 3: Avatar (10 min)

Introduces `aspect-ratio`, `object-fit: cover`, fallback initials via CSS. Three sizes. Status indicator dot.

```css
.avatar {
  --avatar-size: 2.5rem;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--avatar-size);
  block-size: var(--avatar-size);
  border-radius: var(--radius-full);
  background: var(--color-primary-200);
  color: var(--color-primary-700);
  font-weight: var(--weight-semibold);
  font-size: calc(var(--avatar-size) * 0.4);
  overflow: hidden;

  & img {
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
  }

  &.avatar--xs { --avatar-size: 1.5rem; }
  &.avatar--sm { --avatar-size: 2rem; }
  &.avatar--lg { --avatar-size: 3.5rem; }
  &.avatar--xl { --avatar-size: 5rem; }

  /* Status indicator */
  &[data-status]::after {
    content: "";
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    inline-size: calc(var(--avatar-size) * 0.3);
    block-size: calc(var(--avatar-size) * 0.3);
    border-radius: var(--radius-full);
    border: 2px solid var(--surface-page);
  }

  &[data-status="online"]::after  { background: var(--color-success); }
  &[data-status="offline"]::after { background: var(--color-neutral-400); }
  &[data-status="busy"]::after    { background: var(--color-error); }
  &[data-status="away"]::after    { background: var(--color-warning); }
}
```

**Teaching point:** `calc(var(--avatar-size) * 0.4)` makes the font size and status dot proportional to the avatar size. Change one variable, everything scales.

### Component 4: Alert (15 min)

Introduces `:has()` in a simple context -- the alert grid changes when a dismiss button is present or absent.

```css
.alert {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-3);
  align-items: start;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: var(--border-thin) solid var(--border-default);

  /*
   * :has() -- when there is NO dismiss button, let the content
   * span the full width (hide the empty third column).
   */
  &:not(:has(.alert__dismiss)) {
    grid-template-columns: auto 1fr;
  }

  /* --- Variants --- */
  &.alert--info {
    background: color-mix(in oklch, var(--color-info) 8%, var(--surface-raised));
    border-color: color-mix(in oklch, var(--color-info) 30%, transparent);

    & .alert__icon { color: var(--color-info); }
  }
  /* ... success, warning, error variants follow the same pattern */
}
```

**Teaching point:** `:has()` is the parent selector CSS never had. `&:not(:has(.alert__dismiss))` means "an alert that does NOT contain a dismiss button." The parent's grid template changes based on child content, with no JavaScript.

**Exercise:** Add a `.alert--banner` variant that spans full width with no border-radius.

### Component 5: Input Field (20 min)

Deep dive into `:has()`. Label highlighting on focus, error/success states driven purely by CSS validation.

```css
.field {
  display: grid;
  gap: var(--space-1_5);

  & .field__input {
    padding-block: var(--space-2);
    padding-inline: var(--space-3);
    border: var(--border-thin) solid var(--border-default);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    transition:
      border-color var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-primary) 15%, transparent);
    }
  }

  & .field__error {
    font-size: var(--text-xs);
    color: var(--color-error);
    display: none;
  }

  /* :has() -- style parent based on child state */

  /* When input is focused, highlight the label */
  &:has(.field__input:focus) {
    & .field__label {
      color: var(--color-primary);
    }
  }

  /* When input is invalid AND not empty */
  &:has(.field__input:invalid:not(:placeholder-shown)) {
    & .field__input {
      border-color: var(--color-error);
    }
    & .field__label {
      color: var(--color-error);
    }
    & .field__error {
      display: block;
    }
    & .field__hint {
      display: none;
    }
  }

  /* When input is valid and has content */
  &:has(.field__input:valid:not(:placeholder-shown)) {
    & .field__input {
      border-color: var(--color-success);
    }
  }
}
```

**Teaching point:** `:placeholder-shown` tells us if the field is empty. Combined with `:invalid`, we only show error styles after the user has typed something -- not on page load when every required field is technically invalid.

### Component 6: Toggle/Switch (15 min)

Teaches `appearance: none`, `:checked` pseudo-class, custom checkbox styling.

```css
.toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;

  & .toggle__input {
    appearance: none;
    position: relative;
    inline-size: 2.75rem;
    block-size: 1.5rem;
    background: var(--color-neutral-300);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: background var(--duration-normal) var(--ease-default);

    /* The knob */
    &::before {
      content: "";
      position: absolute;
      inset-block-start: 2px;
      inset-inline-start: 2px;
      inline-size: calc(1.5rem - 4px);
      block-size: calc(1.5rem - 4px);
      background: white;
      border-radius: var(--radius-full);
      transition: translate var(--duration-normal) var(--ease-bounce);
    }

    &:checked {
      background: var(--color-primary);

      &::before {
        translate: calc(2.75rem - 1.5rem) 0;
      }
    }
  }
}
```

**Teaching point:** `appearance: none` strips the browser's default checkbox rendering. We then rebuild it entirely with CSS. The `--ease-bounce` curve gives the knob a satisfying spring feel.

### Component 7: Card (20 min)

Introduces container queries. The card adapts based on its OWN width, not the viewport width.

```css
.card {
  container-type: inline-size;
  container-name: card;
  background: var(--surface-raised);
  border: var(--border-thin) solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  & .card__inner {
    display: grid;
    grid-template-rows: auto 1fr auto;
    block-size: 100%;
  }

  & .card__media {
    aspect-ratio: 16 / 9;
    object-fit: cover;
    inline-size: 100%;
    background: var(--surface-sunken);
  }

  /* :has() variant: card without an image */
  &:not(:has(.card__media)) {
    & .card__body {
      padding-block-start: var(--space-6);
    }
  }

  /*
   * CONTAINER QUERY:
   * When the card container itself is wider than 420px,
   * switch from vertical to horizontal layout.
   */
  @container card (inline-size > 420px) {
    & .card__inner {
      grid-template-columns: 220px 1fr;
      grid-template-rows: 1fr auto;
    }

    & .card__media {
      aspect-ratio: 1;
      block-size: 100%;
      grid-row: 1 / -1;
    }
  }

  @container card (inline-size > 600px) {
    & .card__body {
      padding: var(--space-6);
    }
    & .card__title {
      font-size: var(--text-xl);
    }
    & .card__inner {
      grid-template-columns: 260px 1fr;
    }
  }
}
```

**Teaching point:** `container-type: inline-size` makes the card a container query target. `@container card (inline-size > 420px)` fires when the CARD (not the viewport) is wider than 420px. The same card markup renders vertically in a narrow column and horizontally in a wide one.

**Exercise:** Place the same card markup in containers of different widths and observe the layout changes.

### Component 8: Skeleton Loader (10 min)

Teaches `@keyframes`, gradient animation, and the concept of perceived performance.

```css
.skeleton {
  background: var(--surface-sunken);
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;

  /* Shimmer animation */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in oklch, var(--surface-raised) 60%, transparent),
      transparent
    );
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
  }

  &.skeleton--text   { block-size: 0.875rem; inline-size: 100%; }
  &.skeleton--heading { block-size: 1.5rem; inline-size: 75%; }
  &.skeleton--avatar  { inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--radius-full); }
  &.skeleton--image   { aspect-ratio: 16 / 9; inline-size: 100%; }
  &.skeleton--button  { block-size: 2.25rem; inline-size: 6rem; }
}

@keyframes skeleton-shimmer {
  0%   { translate: -100% 0; }
  100% { translate: 100% 0; }
}
```

**Teaching point:** The shimmer effect uses `translate` on a gradient pseudo-element. `translate` is a composited property, meaning the animation runs on the GPU and does not trigger layout recalculations.

### Component 9: Dialog/Modal (20 min)

Teaches native `<dialog>`, `::backdrop`, `@starting-style` for entry animations, focus trapping for free.

```css
.dialog {
  border: none;
  border-radius: var(--radius-2xl);
  padding: 0;
  max-inline-size: min(90vw, 520px);
  inline-size: 100%;
  box-shadow: var(--shadow-xl);
  background: var(--surface-overlay);
  color: var(--text-primary);

  &::backdrop {
    background: oklch(0% 0 0 / 50%);
    backdrop-filter: blur(4px);
  }

  /* Entry animation */
  &[open] {
    animation: dialog-enter var(--duration-slow) var(--ease-out);
  }

  &[open]::backdrop {
    animation: backdrop-enter var(--duration-slow) var(--ease-out);
  }
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    translate: 0 -0.75rem;
    scale: 0.96;
  }
}

@keyframes backdrop-enter {
  from { opacity: 0; }
}
```

**Teaching point:** The native `<dialog>` element provides focus trapping, Escape-to-close, and proper backdrop -- all for free. `dialog.showModal()` opens it as a modal. No JavaScript library needed for the core behavior.

**Advanced:** `@scope` can be used for style encapsulation within the dialog, but regular nesting with `.dialog` class selectors achieves the same result more portably. `@scope` is best saved as an advanced topic.

### Component 10: Progress Bar (5 min)

Second use of `@property` for animating width via a custom property.

```css
.progress {
  --progress-value: 0%;

  inline-size: 100%;
  block-size: 0.5rem;
  background: var(--surface-sunken);
  border-radius: var(--radius-full);
  overflow: hidden;

  & .progress__fill {
    block-size: 100%;
    inline-size: var(--progress-value);
    background: var(--color-primary);
    border-radius: inherit;
    transition: --progress-value var(--duration-slow) var(--ease-out);
  }

  &.progress--indeterminate .progress__fill {
    inline-size: 40%;
    animation: progress-indeterminate 1.5s var(--ease-in-out) infinite;
  }
}

@keyframes progress-indeterminate {
  0%   { translate: -100% 0; }
  100% { translate: 250% 0; }
}
```

**Teaching point:** This is the second place `@property` appears. `--progress-value` is registered as `<percentage>`, so `transition: --progress-value` smoothly animates the fill width. Update the CSS custom property value and the bar slides smoothly.

### Component 11: Tooltip (10 min)

Teaches CSS-only tooltip positioning with hover/focus triggers.

```css
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.tooltip {
  position: absolute;
  inset-block-end: calc(100% + var(--space-2));
  inset-inline-start: 50%;
  translate: -50% 0;
  padding-block: var(--space-1);
  padding-inline: var(--space-2);
  background: var(--color-neutral-800);
  color: var(--color-neutral-50);
  font-size: var(--text-xs);
  border-radius: var(--radius-md);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition:
    opacity var(--duration-fast) var(--ease-default),
    translate var(--duration-fast) var(--ease-default);
  z-index: var(--z-tooltip);

  /* Arrow */
  &::after {
    content: "";
    position: absolute;
    inset-block-start: 100%;
    inset-inline-start: 50%;
    translate: -50% 0;
    border: 5px solid transparent;
    border-block-start-color: var(--color-neutral-800);
  }
}

.tooltip-wrapper:hover .tooltip,
.tooltip-wrapper:focus-within .tooltip {
  opacity: 1;
  translate: -50% -2px;
}
```

**Teaching point:** The tooltip is always in the DOM, just invisible (`opacity: 0`). On hover or focus-within, it fades in and shifts up slightly. `pointer-events: none` prevents it from blocking mouse interaction with elements behind it.

### Component 12: Divider (5 min)

Simple, teaches `<hr>` styling with logical properties.

```css
.divider {
  border: none;
  border-block-start: var(--border-thin) solid var(--border-default);
  margin-block: var(--space-6);

  &.divider--subtle { border-color: var(--surface-sunken); }
  &.divider--strong {
    border-block-start-width: var(--border-medium);
    border-color: var(--border-strong);
  }
  &.divider--spacing-sm { margin-block: var(--space-3); }
  &.divider--spacing-lg { margin-block: var(--space-10); }
}
```

**Teaching point:** `border-block-start` is the logical property equivalent of `border-top`. In right-to-left or vertical writing modes, it automatically adapts. Always prefer logical properties in a design system meant for internationalization.

**After each component:** Brief exercise -- modify the component (add a variant, change tokens, combine it with a previously built component).

---

## Part 4 -- Dark Mode

**Time: ~30 minutes**

Explain the architecture: components use SEMANTIC tokens (`--text-primary`, `--surface-raised`), not raw color tokens (`--color-neutral-900`). Dark mode swaps only the semantic layer.

Three-state toggle: **Light** / **Dark** / **System** (follows OS preference).

### Implementation

1. `@media (prefers-color-scheme: dark)` for automatic switching:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;

    --text-primary:   var(--color-neutral-50);
    --text-secondary: var(--color-neutral-300);
    --text-muted:     var(--color-neutral-500);
    --text-inverse:   var(--color-neutral-900);

    --surface-page:    var(--color-neutral-950);
    --surface-raised:  var(--color-neutral-900);
    --surface-sunken:  var(--color-neutral-950);
    --surface-overlay: var(--color-neutral-800);

    --border-default: var(--color-neutral-700);
    --border-strong:  var(--color-neutral-500);

    /* Shadows need to be stronger in dark mode to be visible */
    --shadow-xs:  0 1px 2px oklch(0% 0 0 / 15%);
    --shadow-sm:  0 1px 3px oklch(0% 0 0 / 20%), 0 1px 2px oklch(0% 0 0 / 15%);
    /* ... etc */
  }
}
```

**Teaching point:** `:root:not([data-theme="light"])` means "apply dark mode UNLESS the user has explicitly set light mode." This lets the media query work automatically while still allowing manual overrides.

2. `[data-theme="dark"]` for manual override (same token values):

```css
[data-theme="dark"] {
  color-scheme: dark;
  /* ... same overrides as above ... */
}

[data-theme="light"] {
  color-scheme: light;
}
```

3. `localStorage` persistence in `theme.js`:

```javascript
const STORAGE_KEY = "ds-theme";
const CYCLE = ["system", "light", "dark"];

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light") root.setAttribute("data-theme", "light");
  else if (theme === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme"); // system
}
```

4. Flash prevention via inline `<script>` in `<head>`:

```html
<script>
  (function() {
    try {
      var theme = localStorage.getItem('ds-theme');
      if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    } catch(e) {}
  })();
</script>
```

**Teaching point:** This inline script runs synchronously before the page paints. Without it, users would see a flash of the wrong theme on reload. This is the single exception to "don't put scripts in `<head>`."

---

## Part 5 -- Utilities & Accessibility

**Time: ~20 minutes**

Build utility classes in `utilities.css` inside `@layer utilities`:

```css
@layer utilities {
  /* Text alignment */
  .text-center  { text-align: center; }
  .text-start   { text-align: start; }
  .text-end     { text-align: end; }

  /* Display */
  .flex   { display: flex; }
  .grid   { display: grid; }
  .hidden { display: none; }

  /* Flex utilities */
  .items-center    { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-4           { gap: var(--space-4); }

  /* Layout primitives */
  .stack > * + * {
    margin-block-start: var(--space-4);
  }

  .cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .center {
    max-inline-size: 70ch;
    margin-inline: auto;
    padding-inline: var(--space-4);
  }

  /* Accessibility */
  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    block-size: 1px;
    inline-size: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
  }
}
```

### Accessibility Audit

- **`prefers-reduced-motion: reduce`** -- Already handled: duration tokens are zeroed out, disabling all animations globally
- **Focus visibility** on every interactive element -- handled by the reset's `:focus-visible` rule using `--focus-ring`
- **Sufficient color contrast** in both themes -- verify with browser DevTools
- **Screen reader considerations** -- `visually-hidden` class, proper `aria-label` attributes on icon buttons

---

## Part 6 -- Showcase Page

**Time: ~45 minutes**

Build a complete, polished, single-page demonstration in `index.html`:

- Sticky header with theme toggle and navigation
- Sections for: color palette, typography scale, spacing scale, each component with all variants
- Responsive page layout using CSS grid
- Anchor-link navigation
- Each section shows the rendered component in a demo container

The showcase uses additional layout-specific components defined at the end of `components.css`:

- `.showcase-header` -- sticky, blurred background
- `.section` / `.section__title` / `.section__subtitle` -- page sections
- `.component-demo` -- bordered container for component previews
- `.demo-row` / `.demo-grid` -- layout helpers for component rows
- `.swatch-grid` / `.swatch` -- color palette display
- `.hero` -- gradient title banner

See the complete `solution/index.html` for the full markup.

---

## Part 7 -- Wrap-Up & When NOT to Use These Features

**Time: ~15 minutes**

Honest discussion of trade-offs:

- **`@scope`**: Limited browser support history. Regular nesting with class selectors usually suffices for encapsulation. Use `@scope` when you genuinely need lower boundary containment.
- **`@property`**: Only register properties you actually need to animate. Over-registering adds overhead. Use it when you need the browser to interpolate a custom property value.
- **`:has()`**: Avoid overly broad selectors like `body:has(.something)` -- they can trigger expensive style recalculations. Keep `:has()` scoped to the nearest relevant ancestor.
- **`oklch()`**: Excellent for design-time palette generation. If you need exact hex color matching with an existing brand guide, convert the final oklch values to hex.
- **Native nesting**: Keep it shallow -- 2-3 levels max. Deep nesting in CSS is just as unreadable as deep Sass nesting.
- **Container queries vs. media queries**: Different tools for different jobs. Use media queries for page-level layout (sidebar collapses on mobile). Use container queries for component-level adaptation (card layout changes based on card width).

---

## Final Solution

A complete working design system is in the `solution/` directory. Open `solution/index.html` in a modern browser to see all components. No build step needed.

```
solution/
  index.html      -- Showcase page with every component demo
  main.css        -- Layer ordering and imports
  tokens.css      -- Complete design tokens (colors, typography, spacing, shadows, z-index, transitions)
  reset.css       -- Modern CSS reset
  components.css  -- All 12 component styles + showcase layout
  utilities.css   -- Utility classes
  theme.js        -- Dark mode toggle with localStorage persistence
```

The solution demonstrates:
- 12 components: Badge, Button, Avatar, Alert, Input Field, Toggle/Switch, Card, Skeleton Loader, Dialog/Modal, Progress Bar, Tooltip, Divider
- Full dark mode with three states (Light / Dark / System) and `localStorage` persistence
- Container queries on the Card component
- `:has()` selector on Alert, Input Field, and Card components
- `@property` on Button and Progress Bar for smooth color/width animations
- `oklch()` and `color-mix()` for the entire color palette
- `@layer` cascade management across all files
- `prefers-reduced-motion` support via token overrides
- Fluid typography via `clamp()`
- Logical properties throughout
