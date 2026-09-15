---
trigger: always_on
---

# File Size & Cohesion — Backend

Keep NestJS backend files **below 150 lines wherever reasonably possible**.

Files should be small, cohesive, and focused on a clear responsibility.

When a file approaches or exceeds 150 lines:

* Inspect the file for multiple responsibilities.
* Identify logical boundaries in the code.
* Extract cohesive responsibilities into appropriately named services, repositories, DTOs, mappers, guards, or utilities.
* Keep related logic together when separating it would reduce clarity.
* Preserve existing NestJS module boundaries and dependency injection.
* Prefer meaningful feature-based files over arbitrary splits.
* Reuse existing abstractions before creating new ones.
* Do not duplicate logic merely to reduce file size.
* Do not create tiny or meaningless files solely to satisfy the line limit.
* Do not change business behavior, API contracts, or database behavior as part of a structural split.

A file may exceed 150 lines when there is a **clear architectural reason** that splitting it would make the code less cohesive or harder to understand.

The goal is not to minimize line count. The goal is:

> **Small, cohesive, understandable files with clear responsibilities and minimal duplication.**
