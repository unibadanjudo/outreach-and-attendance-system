---
trigger: always_on
---

# Design System — Frontend

Use one centralized design system across the application.

Before adding UI, inspect the existing Tailwind configuration, CSS variables, shared components, and visual patterns.

Use **CSS variables as the source of truth** and Tailwind utilities as the primary way components consume those tokens.

Centralize:

* Colors
* Typography
* Spacing
* Border radius
* Borders
* Shadows
* Transitions
* Component dimensions

Prefer semantic tokens such as:

`primary`, `surface`, `background`, `text`, `text-muted`, `border`, `success`, `warning`, `error`.

Use fluid `clamp()` values where appropriate for typography and spacing.

Avoid arbitrary Tailwind values when an existing design token can be used.

Do not introduce a competing styling system or create duplicate tokens.

Always reuse existing components and design patterns before creating new ones.
