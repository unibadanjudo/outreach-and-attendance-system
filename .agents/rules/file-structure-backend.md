---
trigger: always_on
---

# File Structure — Backend

Use NestJS feature modules to keep the backend organized around the application's domains.

Core domains include:

* Members
* Attendance
* Outreach
* Authentication
* Users/Permissions
* Notifications where required

Keep responsibilities separated:

* Controllers → HTTP/API boundary
* Services → business/application logic
* Repositories/Data Access → database operations
* DTOs → API input/output contracts
* Guards → authentication/authorization

Keep feature-specific logic inside its feature module.

Only create shared/common abstractions when they are genuinely reusable.

Prefer a simple modular NestJS monolith. Do not introduce microservices, CQRS, event buses, or other complex architecture without a real requirement.
