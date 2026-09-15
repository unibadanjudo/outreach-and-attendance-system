---
trigger: always_on
---

# File Structure — Frontend

The frontend must use `lib/` as the primary application source directory.

Organize the frontend by **feature first, responsibility second**.

Features should be clearly separated and internally well-arranged. Avoid putting every component for a feature directly into one large folder when the feature contains distinct UI sections.

Use this structure as the general convention:

```text
src/
├── lib/
│   ├── components/
│   │   ├── common/
│   │   │   ├── modal/
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   ├── dropdown/
│   │   │   ├── badge/
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar/
│   │   │   ├── header/
│   │   │   ├── navigation/
│   │   │   └── ...
│   │   │
│   │   ├── members/
│   │   │   ├── table/
│   │   │   │   ├── tableHeader/
│   │   │   │   ├── tableBody/
│   │   │   │   ├── tableRow/
│   │   │   │   ├── tableFooter/
│   │   │   │   └── ...
│   │   │   ├── form/
│   │   │   ├── filters/
│   │   │   ├── cards/
│   │   │   └── ...
│   │   │
│   │   ├── attendance/
│   │   │   ├── table/
│   │   │   │   ├── tableHeader/
│   │   │   │   ├── tableBody/
│   │   │   │   ├── tableRow/
│   │   │   │   ├── tableFooter/
│   │   │   │   └── ...
│   │   │   ├── filters/
│   │   │   ├── cards/
│   │   │   ├── summary/
│   │   │   └── ...
│   │   │
│   │   ├── outreach/
│   │   │   ├── table/
│   │   │   ├── form/
│   │   │   ├── filters/
│   │   │   ├── cards/
│   │   │   └── ...
│   │   │
│   │   └── dashboard/
│   │       ├── cards/
│   │       ├── charts/
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── members/
│   │   ├── attendance/
│   │   ├── outreach/
│   │   └── dashboard/
│   │
│   ├── api/
│   │   ├── members.ts
│   │   ├── attendance.ts
│   │   ├── outreach.ts
│   │   └── ...
│   │
│   ├── types/
│   │   ├── members.ts
│   │   ├── attendance.ts
│   │   ├── outreach.ts
│   │   └── ...
│   │
│   └── utils/
│
├── pages/
│   ├── dashboard/
│   ├── members/
│   ├── attendance/
│   ├── outreach/
│   └── ...
│
└── ...
```

## Feature Organization

Each major feature should have a clearly defined area under `lib/components/`.

For example:

```text
lib/components/attendance/
├── table/
├── filters/
├── cards/
├── summary/
└── ...
```

If a section becomes sufficiently complex, split it further:

```text
lib/components/attendance/table/
├── tableHeader/
├── tableBody/
├── tableRow/
├── tableFooter/
└── ...
```

Do not create this level of nesting for simple features. The structure should reflect actual complexity, not introduce complexity unnecessarily.

## Common Components

Components that are genuinely reusable across multiple features belong in:

```text
lib/components/common/
```

Examples:

```text
lib/components/common/modal/
lib/components/common/button/
lib/components/common/input/
lib/components/common/confirmation-dialog/
lib/components/common/loading-state/
lib/components/common/empty-state/
```

Do not put feature-specific components in `common`.

For example, an attendance-specific modal belongs in:

```text
lib/components/attendance/
```

not:

```text
lib/components/common/
```

Only move a component to `common` when it is genuinely shared.

## Layout

Application-wide layout components belong in:

```text
lib/components/layout/
```

Examples:

```text
lib/components/layout/
├── sidebar/
├── header/
├── navigation/
├── page-container/
└── ...
```

Keep layout components separate from feature components.

Feature components should not contain application-wide navigation, sidebar, header, or shell logic.

## Pages

Pages should also be organized by feature when the application contains multiple pages for that feature.

For example:

```text
pages/
├── dashboard/
│   └── DashboardPage.tsx
│
├── members/
│   ├── MembersPage.tsx
│   ├── MemberDetailsPage.tsx
│   └── MemberCreatePage.tsx
│
├── attendance/
│   └── AttendancePage.tsx
│
└── outreach/
    ├── OutreachPage.tsx
    └── OutreachDetailsPage.tsx
```

If a page becomes complex, its page-specific supporting components may be colocated with the page or moved into the corresponding feature under `lib/components/`.

Do not place reusable feature components inside `pages/`.

## General Rules

* Use `lib/` for application code.
* Organize primarily by **feature**.
* Organize complex features into meaningful sub-sections such as `table`, `form`, `filters`, `cards`, and `summary`.
* Keep shared components in `lib/components/common/`.
* Keep application-wide shell/layout components in `lib/components/layout/`.
* Keep pages organized by feature when necessary.
* Keep API, hooks, types, and utilities separated by responsibility.
* Avoid unnecessary deep nesting for small or simple components.
* Feature-specific code must remain with its feature.
* Shared code must only be shared when there is a real reuse case.
* Before creating a component, hook, utility, or type, search the existing codebase for something that can be reused or extended.
* Prefer extending existing structures over creating duplicates.
* Keep files below **150 lines where reasonably possible**, but never split cohesive code merely to satisfy the limit.
* Do not introduce a new folder merely for organizational appearance; every folder should represent a meaningful boundary.
