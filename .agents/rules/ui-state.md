---
trigger: always_on
---

# UI States

Every data-driven feature should properly handle:

* Loading
* Success
* Empty
* Error

Where applicable, also handle:

* Submitting
* Disabled
* Unauthorized
* Forbidden
* Retry

Reuse existing shared state components and patterns.

Do not create separate implementations for common loading, empty, or error states when an existing component can be reused.
