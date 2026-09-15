---
trigger: always_on
---

# Implementation Process

For every task:

1. **Inspect** the existing codebase before changing anything.
2. **Plan** where the change belongs and what can be reused.
3. **Implement** incrementally using existing patterns.
4. **Verify** the result through types, tests, linting, builds, and manual inspection where appropriate.

Do not immediately create new files or rewrite existing code.

Before completing a task, verify that:

* Existing functionality still works.
* No unnecessary files were created.
* No duplicate logic was introduced.
* Frontend and backend contracts remain consistent.
* The design system is being followed.
* Business logic remains in the appropriate backend layer.
* The implementation is clean and understandable to the next developer.
