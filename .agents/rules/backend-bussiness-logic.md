---
trigger: always_on
---

# Backend Business Logic

The backend is the authoritative source of business rules and application data.

Important Judo-club rules must live on the backend, including:

* Attendance rules
* Inactivity detection
* Outreach eligibility
* Member status
* Permissions
* Data integrity

Do not rely on the frontend to enforce business rules.

Controllers should remain thin.

Business logic should live primarily in NestJS services.

The database should remain the source of truth for persistent data.
