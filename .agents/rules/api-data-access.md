---
trigger: always_on
---

# API & Data Access

Keep API communication centralized.

Frontend:

`Component → Hook → API → Backend`

Backend:

`Controller → Service → Repository/Data Access → Database`

Do not place substantial API or database logic inside React components or NestJS controllers.

Use DTOs to validate API input.

Keep API contracts consistent between frontend and backend.

Do not duplicate database queries or API implementations.
