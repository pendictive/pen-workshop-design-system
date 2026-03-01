# Workshop: Modern Design System from Scratch

A hands-on workshop for frontend juniors to build a production-quality component library using only modern CSS — no Sass, no CSS-in-JS, no frameworks.

## What You'll Build

A complete design system with **12 components**, a **dark mode** toggle, and a polished **showcase page** — all using cutting-edge CSS features that have eliminated the need for preprocessors.

## What You'll Learn

- CSS custom properties as design tokens
- `@layer` for cascade management (no more specificity wars)
- Native CSS nesting (goodbye Sass)
- `oklch()` and `color-mix()` for perceptually uniform color palettes
- `@property` for typed, animatable custom properties
- Container queries for self-adapting components
- `:has()` for parent-aware styling without JavaScript
- `@starting-style` for entry animations
- `prefers-reduced-motion` and `prefers-color-scheme`
- Logical properties for internationalization-ready CSS
- Dark mode via semantic token swapping (three-state: light / dark / system)

## Components

| Component | Key CSS Feature |
|-----------|----------------|
| Badge | `color-mix()` for semi-transparent backgrounds |
| Button | `@property` for animatable custom properties |
| Avatar | `aspect-ratio`, `object-fit`, fallback initials |
| Alert | `:has()` for dismiss button awareness |
| Input Field | `:has()` for CSS-only validation states |
| Toggle/Switch | `appearance: none`, `:checked` styling |
| Card | Container queries for layout adaptation |
| Skeleton Loader | `@keyframes` gradient shimmer animation |
| Dialog/Modal | Native `<dialog>`, `@starting-style` |
| Progress Bar | `@property` animation for width |
| Tooltip | Hover/focus display, positioning |
| Divider | `<hr>` styling with logical properties |

## Prerequisites

- Basic CSS knowledge (selectors, box model, flexbox, grid)
- A modern browser (Chrome 120+, Firefox 128+, Safari 17.4+)
- A code editor

## Getting Started

1. Clone this repo:
   ```bash
   git clone https://github.com/pendictive/pen-workshop-design-system.git
   cd pen-workshop-design-system
   ```

2. Open **[WORKSHOP.md](WORKSHOP.md)** and follow the guide.

3. You'll build each component incrementally — tokens first, then reset, then components one by one.

## Duration

~5-6 hours (with breaks)

## Repo Structure

```
├── WORKSHOP.md              ← Start here — the full workshop guide
└── solution/
    ├── index.html           ← Complete showcase page (open this!)
    ├── main.css             ← @layer ordering and @imports
    ├── tokens.css           ← Design tokens (colors, spacing, typography)
    ├── reset.css            ← Modern CSS reset
    ├── components.css       ← All 12 component styles
    ├── utilities.css        ← Utility classes
    └── theme.js             ← Dark mode toggle (system/light/dark)
```

## Final Solution

Open `solution/index.html` in a modern browser to see the complete design system with every component, all variants, dark mode, and a full color/typography/spacing showcase.

> No build step needed — works directly from the filesystem.
