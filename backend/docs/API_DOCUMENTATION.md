# UI Judo Club Attendance & Member Outreach API Documentation

This document describes all active REST API endpoints in the UI Judo Club backend.

---

## 1. General API Information

- **Base URL**: `http://localhost:3000/api` (or configured `PORT` in `.env`)
- **Swagger Interactive Docs**: `http://localhost:3000/api/docs`
- **Postman Collection**: [postman_collection.json](../postman_collection.json)

### Standard Success Response Envelope
All successful responses are automatically wrapped in a unified envelope via `TransformInterceptor`:
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response Envelope
All exceptions are formatted consistently via `HttpExceptionFilter`:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description",
    "timestamp": "2026-09-13T07:30:00.000Z",
    "path": "/api/..."
  }
}
```

### Authentication Mechanism
- Protected endpoints require an active session cookie: `uijudo.sid`.
- Session cookies are **HTTP-only, Lax / SameSite, and secure in production**.
- In Postman, cookies set by `/api/auth/google/callback` or session simulation are automatically stored in the Postman Cookie Jar and sent with subsequent requests.

---

## 2. Endpoints Reference

### Health Module

#### `GET /api/health`
Checks API server availability, uptime, and running environment.

- **Authentication**: None
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/health
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "timestamp": "2026-09-13T07:30:00.000Z",
      "uptime": 142.5,
      "environment": "development"
    }
  }
  ```

---

### Authentication Module

#### `GET /api/auth/google`
Initiates Google OAuth 2.0 flow. Redirects user to Google sign-in consent screen.

- **Authentication**: None
- **Response**: `302 Found` (redirect to Google Accounts)
- **Postman / Browser Workflow**:
  - In Postman, trigger **"Initiate Google OAuth (Open in Browser)"**.
  - Inspect the **Visualize** tab, which automatically launches the system browser (or provides a direct button).
  - Complete Google sign-in in the browser.
  - The browser is redirected to `/api/auth/google/callback`, receiving the `uijudo.sid` session cookie on `localhost`.
  - Pass query `?state=postman` to display an in-browser confirmation page with session details.

#### `GET /api/auth/google/callback`
Google OAuth 2.0 callback URL. Validates user against `AUTHORIZED_EMAILS`, issues session cookie, and redirects to frontend (or renders confirmation page if `state=postman`).

- **Authentication**: None (handled by Passport Google Strategy)
- **Response**: `302 Found` (redirect to `FRONTEND_URL` or HTML page if `state=postman`)
- **Set-Cookie**: `uijudo.sid=...; HttpOnly; Path=/; Max-Age=604800`

#### `GET /api/auth/status`
Checks if the current client is authenticated without throwing a 401 error.

- **Authentication**: None
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/auth/status \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK - Authenticated)**:
  ```json
  {
    "success": true,
    "data": {
      "isAuthenticated": true,
      "user": {
        "email": "coach@uijudo.club",
        "name": "UI Coach",
        "role": "ADMIN"
      }
    }
  }
  ```
- **Response (200 OK - Not Authenticated)**:
  ```json
  {
    "success": true,
    "data": {
      "isAuthenticated": false,
      "user": null
    }
  }
  ```

#### `GET /api/auth/me`
Returns current user profile details from the session.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/auth/me \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "email": "coach@uijudo.club",
      "name": "UI Coach",
      "role": "ADMIN"
    }
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Authentication required",
      "timestamp": "2026-09-13T07:30:00.000Z"
    }
  }
  ```

#### `POST /api/auth/logout`
Terminates the session and destroys the cookie.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **cURL**:
  ```bash
  curl -X POST http://localhost:3000/api/auth/logout \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Logged out successfully"
    }
  }
  ```

---

### Members Module

#### `GET /api/members`
Lists all members adapted from Google Sheets with pagination and multi-field search.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **Query Parameters**:
  | Param | Type | Required | Default | Description |
  |---|---|:---:|:---:|---|
  | `search` | string | No | - | Search keyword across names, phone, matric, and faculty/department |
  | `facultyDepartment` | string | No | - | Filter by faculty or department |
  | `page` | integer | No | 1 | Page number (1-based) |
  | `limit` | integer | No | 50 | Items per page (min 1, max 100) |
- **cURL**:
  ```bash
  curl -X GET "http://localhost:3000/api/members?page=1&limit=20&search=Kano" \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "mem_08011112222",
          "firstName": "Jigoro",
          "lastName": "Kano",
          "otherNames": "Master",
          "nickname": "Father of Judo",
          "phoneNumber": "08011112222",
          "facultyDepartment": "Education - Sports",
          "matricNumber": "111111",
          "dateOfBirth": "1860-10-28",
          "judoStartDate": "1882-05-01",
          "motivation": "Self Defense & Education",
          "createdAt": "2026-01-01T10:00:00.000Z",
          "updatedAt": "2026-01-01T10:00:00.000Z"
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 20,
        "totalPages": 1
      }
    }
  }
  ```

#### `GET /api/members/:id`
Retrieves a single member profile using Member ID, Phone Number, or Matric Number.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **Path Parameters**:
  - `id`: Member ID (e.g. `mem_08011112222`), Phone Number (`08011112222`), or Matric (`111111`)
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/members/08011112222 \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "mem_08011112222",
      "firstName": "Jigoro",
      "lastName": "Kano",
      "otherNames": "Master",
      "nickname": "Father of Judo",
      "phoneNumber": "08011112222",
      "facultyDepartment": "Education - Sports",
      "matricNumber": "111111",
      "dateOfBirth": "1860-10-28",
      "judoStartDate": "1882-05-01",
      "motivation": "Self Defense & Education",
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-01T10:00:00.000Z"
    }
  }
  ```
- **Response (404 Not Found)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "MEMBER_NOT_FOUND",
      "message": "Member with identifier \"unknown\" not found.",
      "timestamp": "2026-09-13T07:30:00.000Z"
    }
  }
  ```

#### `GET /api/members/:id/summary`
Retrieves comprehensive member details, complete attendance statistics, longitudinal trend, outreach history, next scheduled follow-up, and recommended club action.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **Path Parameters**:
  - `id`: Member ID, Phone Number, or Matric Number
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/members/mem_08011112222/summary \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "member": {
        "id": "mem_08011112222",
        "firstName": "Jigoro",
        "lastName": "Kano",
        "otherNames": "Master",
        "nickname": "Father of Judo",
        "phoneNumber": "08011112222",
        "facultyDepartment": "Education - Sports",
        "matricNumber": "111111",
        "dateOfBirth": "1860-10-28",
        "judoStartDate": "1882-05-01",
        "motivation": "Self Defense & Education",
        "createdAt": "2026-01-01T10:00:00.000Z",
        "updatedAt": "2026-01-01T10:00:00.000Z"
      },
      "attendanceStats": {
        "totalAttendance": 14,
        "attendanceLast7Days": 2,
        "attendanceLast30Days": 8,
        "attendanceLast60Days": 14,
        "attendanceLast90Days": 14,
        "attendanceFrequency": 2.0
      },
      "attendanceTrend": "STABLE",
      "lastAttendance": "2026-09-11",
      "activityStatus": "ACTIVE",
      "outreachHistory": [],
      "lastOutreach": null,
      "nextFollowUp": null,
      "recommendedAction": "Maintain regular training participation",
      "attendanceCount": 14,
      "lastAttendedDate": "2026-09-11",
      "outreachCount": 0,
      "lastOutreachDate": null
    }
  }
  ```

#### `GET /api/members/:id/activity`
Retrieves detailed longitudinal attendance analytics and inactivity status for a member.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **Path Parameters**:
  - `id`: Member ID, Phone Number, or Matric Number
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/members/08011112222/activity \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "memberId": "mem_08011112222",
      "status": "ACTIVE",
      "daysInactive": 2,
      "analytics": {
        "totalAttendance": 14,
        "attendanceInLast7Days": 2,
        "attendanceInLast30Days": 6,
        "attendanceInLast60Days": 10,
        "attendanceInLast90Days": 14,
        "lastAttendanceDate": "2026-09-11",
        "previousAttendanceDate": "2026-09-08",
        "daysSinceLastAttendance": 2,
        "attendanceFrequency": 1.09,
        "recentAttendanceTrend": "INCREASING"
      }
    }
  }
  ```

---

### Attendance Module

All Attendance endpoints require staff authentication via session cookie (`uijudo.sid`). Attendance is stored in a dedicated Google Sheets tab (`Attendance`) and dates are normalized in `Africa/Lagos` time (`YYYY-MM-DD`).

#### `POST /api/attendance`
Records training attendance for a member.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **Duplicate Prevention**: If attendance already exists for `memberId + attendanceDate + trainingSession`, returns `409 Conflict`. Set `"isCorrection": true` to overwrite existing record.
- **cURL**:
  ```bash
  curl -X POST http://localhost:3000/api/attendance \
    -b "uijudo.sid=YOUR_SESSION_COOKIE" \
    -H "Content-Type: application/json" \
    -d '{
      "memberId": "08011112222",
      "attendanceDate": "2026-09-13",
      "trainingSession": "Evening",
      "status": "PRESENT",
      "notes": "Strong randori session",
      "isCorrection": false
    }'
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "att_1726214400000_abc123",
      "memberId": "08011112222",
      "attendanceDate": "2026-09-13",
      "trainingSession": "Evening",
      "status": "PRESENT",
      "recordedBy": "Sensei Coach <coach@uijudo.org>",
      "notes": "Strong randori session",
      "createdAt": "2026-09-13T17:30:00.000Z"
    }
  }
  ```
- **Response (409 Conflict - Duplicate)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "ATTENDANCE_ALREADY_RECORDED",
      "message": "Attendance already recorded for member 08011112222 on 2026-09-13 (Evening). Set isCorrection to true to overwrite or use PATCH /api/attendance/:id.",
      "timestamp": "2026-09-13T17:30:00.000Z"
    }
  }
  ```

#### `GET /api/attendance`
Lists attendance records with filtering and pagination.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **Query Parameters**:
  - `member` (optional): Filter by member ID, phone number, or matric number
  - `date` (optional): Filter by exact date (`YYYY-MM-DD`)
  - `startDate` (optional): Filter start date (`YYYY-MM-DD`)
  - `endDate` (optional): Filter end date (`YYYY-MM-DD`)
  - `session` (optional): Filter by training session (`Morning`, `Evening`, etc.)
  - `status` (optional): Filter by status (`PRESENT`, `ABSENT`, `EXCUSED`)
  - `page` (optional, default: `1`): Page number
  - `limit` (optional, default: `20`, max: `100`): Items per page
- **cURL**:
  ```bash
  curl -X GET "http://localhost:3000/api/attendance?status=PRESENT&page=1&limit=20" \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "att_1726214400000_abc123",
          "memberId": "08011112222",
          "attendanceDate": "2026-09-13",
          "trainingSession": "Evening",
          "status": "PRESENT",
          "recordedBy": "Sensei Coach <coach@uijudo.org>",
          "notes": "Strong randori session",
          "createdAt": "2026-09-13T17:30:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

#### `GET /api/attendance/:id`
Retrieves a specific attendance record by its ID.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/attendance/att_1726214400000_abc123 \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "att_1726214400000_abc123",
      "memberId": "08011112222",
      "attendanceDate": "2026-09-13",
      "trainingSession": "Evening",
      "status": "PRESENT",
      "recordedBy": "Sensei Coach <coach@uijudo.org>",
      "notes": "Strong randori session",
      "createdAt": "2026-09-13T17:30:00.000Z"
    }
  }
  ```

#### `PATCH /api/attendance/:id`
Updates an existing attendance record (status or notes).

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **cURL**:
  ```bash
  curl -X PATCH http://localhost:3000/api/attendance/att_1726214400000_abc123 \
    -b "uijudo.sid=YOUR_SESSION_COOKIE" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "EXCUSED",
      "notes": "Medical exemption provided"
    }'
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "att_1726214400000_abc123",
      "memberId": "08011112222",
      "attendanceDate": "2026-09-13",
      "trainingSession": "Evening",
      "status": "EXCUSED",
      "recordedBy": "Sensei Coach <coach@uijudo.org>",
      "notes": "Medical exemption provided",
      "createdAt": "2026-09-13T17:30:00.000Z"
    }
  }
  ```

#### `DELETE /api/attendance/:id`
Deletes an attendance record by ID.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **cURL**:
  ```bash
  curl -X DELETE http://localhost:3000/api/attendance/att_1726214400000_abc123 \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Attendance record att_1726214400000_abc123 deleted successfully."
    }
  }
  ```

#### `GET /api/members/:id/attendance`
Retrieves attendance records for a single member with pagination.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **Path Parameters**:
  - `id`: Member identifier (ID, phone number, or matric number)
- **cURL**:
  ```bash
  curl -X GET "http://localhost:3000/api/members/08011112222/attendance?page=1&limit=20" \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "att_1726214400000_abc123",
          "memberId": "08011112222",
          "attendanceDate": "2026-09-13",
          "trainingSession": "Evening",
          "status": "PRESENT",
          "recordedBy": "Sensei Coach <coach@uijudo.org>",
          "notes": "Strong randori session",
          "createdAt": "2026-09-13T17:30:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
  ```

---

### Dashboard Module

#### `GET /api/dashboard/summary`
Retrieves an executive summary across the Judo club including total member counts, activity status distribution, outreach queue load, pending/completed follow-ups, recent attendance counts, and longitudinal attendance trends.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/dashboard/summary \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalMembers": 45,
      "activeMembers": 28,
      "recentlyInactiveMembers": 7,
      "inactiveMembers": 4,
      "longTermInactiveMembers": 3,
      "neverAttendedMembers": 3,
      "membersRequiringOutreach": 14,
      "outreachCompleted": 18,
      "outreachPending": 6,
      "followUpsDue": 2,
      "recentAttendance": 84,
      "attendanceTrends": {
        "increasing": 12,
        "stable": 16,
        "declining": 8,
        "noAttendance": 9
      }
    }
  }
  ```

#### `GET /api/dashboard/attendance`
Retrieves club-wide attendance metrics including total records, past 7/30 days counts, session breakdown (Tuesday vs Thursday vs Saturday), status breakdown (Present/Absent/Excused), daily timeline over the past 14 days, and average attendance per session.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/dashboard/attendance \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalRecords": 150,
      "totalPresent": 135,
      "attendanceLast7Days": 24,
      "attendanceLast30Days": 98,
      "sessionBreakdown": {
        "TUESDAY": 65,
        "THURSDAY": 70
      },
      "statusBreakdown": {
        "PRESENT": 135,
        "ABSENT": 10,
        "EXCUSED": 5
      },
      "dailyAttendanceLast14Days": [
        { "date": "2026-08-31", "count": 16 },
        { "date": "2026-09-02", "count": 18 }
      ],
      "averageAttendancePerSession": 19.3
    }
  }
  ```

#### `GET /api/dashboard/outreach`
Retrieves outreach performance analytics including total contacts, pending vs completed logs, follow-ups currently due, breakdown by communication channel (WhatsApp, Phone Call, Email), breakdown by outcome status, count of members who returned to training after outreach, and the return conversion rate percentage.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **cURL**:
  ```bash
  curl -X GET http://localhost:3000/api/dashboard/outreach \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalOutreach": 32,
      "pendingOutreach": 6,
      "completedOutreach": 26,
      "followUpsDue": 3,
      "contactMethodBreakdown": {
        "WHATSAPP": 18,
        "PHONE_CALL": 10,
        "EMAIL": 4
      },
      "statusBreakdown": {
        "RESPONDED": 12,
        "WILL_RETURN": 8,
        "CONTACTED": 6,
        "NO_RESPONSE": 4,
        "NOT_INTERESTED": 2
      },
      "membersReturnedAfterOutreach": 6,
      "returnConversionRate": 23.1
    }
  }
  ```

#### `GET /api/dashboard/inactive-members`
Retrieves all inactive, recently inactive, and never-attended members ranked by outreach relevance. Active members are excluded by default.

- **Authentication**: 🔒 **Required** (`AuthenticatedGuard`)
- **Query Parameters**:
  - `status` (optional): Filter by activity status (`NEVER_ATTENDED`, `RECENTLY_INACTIVE`, `INACTIVE`, `LONG_TERM_INACTIVE`)
  - `minDays` (optional): Filter minimum days since last attendance
  - `maxDays` (optional): Filter maximum days since last attendance
  - `page` (optional, default: `1`): Page number
  - `limit` (optional, default: `50`, max: `100`): Page size limit
  - `sortBy` (optional, default: `outreachRelevance`): Sort ordering (`outreachRelevance`, `daysInactive`, `attendanceCount`)
- **cURL**:
  ```bash
  curl -X GET "http://localhost:3000/api/dashboard/inactive-members?page=1&limit=50&sortBy=outreachRelevance" \
    -b "uijudo.sid=YOUR_SESSION_COOKIE"
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "member": {
            "id": "mem_08022222222",
            "firstName": "Recent",
            "lastName": "Inactive",
            "otherNames": "",
            "nickname": "",
            "phoneNumber": "08022222222",
            "facultyDepartment": "Science",
            "matricNumber": "222222",
            "dateOfBirth": "2000-01-01",
            "judoStartDate": "2024-01-01",
            "motivation": "Self Defense",
            "createdAt": "2026-01-01T00:00:00.000Z",
            "updatedAt": "2026-01-01T00:00:00.000Z"
          },
          "lastAttendance": "2026-08-24",
          "daysInactive": 20,
          "attendanceCount": 15,
          "activityStatus": "RECENTLY_INACTIVE",
          "priorityScore": 10280
        },
        {
          "member": {
            "id": "mem_08033333333",
            "firstName": "Never",
            "lastName": "Attended",
            "otherNames": "",
            "nickname": "",
            "phoneNumber": "08033333333",
            "facultyDepartment": "Arts",
            "matricNumber": "333333",
            "dateOfBirth": "2000-01-01",
            "judoStartDate": "2024-01-01",
            "motivation": "Fitness",
            "createdAt": "2026-01-01T00:00:00.000Z",
            "updatedAt": "2026-01-01T00:00:00.000Z"
          },
          "lastAttendance": null,
          "daysInactive": null,
          "attendanceCount": 0,
          "activityStatus": "NEVER_ATTENDED",
          "priorityScore": 2500
        }
      ],
      "total": 2,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
  ```

### Outreach Module

#### `GET /api/outreach`
List all recorded member outreach logs with optional filtering by member, status, method, and date range.

- **Authentication**: Required (`uijudo.sid` session cookie)
- **Query Parameters**:
  - `memberId` (optional): Filter logs for a specific member ID.
  - `status` (optional): `PENDING`, `CONTACTED`, `RESPONDED`, `NO_RESPONSE`, `WILL_RETURN`, `NOT_INTERESTED`, `TEMPORARILY_UNAVAILABLE`, `UNKNOWN`.
  - `contactMethod` (optional): `PHONE_CALL`, `WHATSAPP`, `SMS`, `EMAIL`, `IN_PERSON`, `OTHER`.
  - `startDate` (optional, YYYY-MM-DD): Filter contacts on or after date.
  - `endDate` (optional, YYYY-MM-DD): Filter contacts on or before date.
  - `page` (optional, default: 1)
  - `limit` (optional, default: 50)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "outreach-1726218000000-123",
          "memberId": "mem_09028872023",
          "contactedBy": "Coach Musa",
          "contactedAt": "2026-09-12T10:30:00.000Z",
          "contactMethod": "WHATSAPP",
          "status": "RESPONDED",
          "message": "Checked in regarding absence from Friday training.",
          "response": "Member had exams, planning to resume next Friday.",
          "nextFollowUpDate": "2026-09-19",
          "createdAt": "2026-09-12T10:30:00.000Z",
          "updatedAt": "2026-09-12T10:35:00.000Z"
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 50,
        "totalPages": 1
      }
    }
  }
  ```

#### `GET /api/outreach/queue`
Core outreach workflow endpoint. Computes a prioritized list of members requiring check-ins, follow-ups, or onboarding contacts, ranked by retention urgency (`HIGH`, `MEDIUM`, `LOW`) with dynamic backend-recommended actions.

- **Authentication**: Required (`uijudo.sid` session cookie)
- **Query Parameters**:
  - `priority` (optional): `HIGH`, `MEDIUM`, `LOW`.
  - `activityStatus` (optional): `ACTIVE`, `RECENTLY_INACTIVE`, `INACTIVE`, `LONG_TERM_INACTIVE`, `NEVER_ATTENDED`.
  - `onlyDue` (optional, boolean `true`/`false`): Only return members whose follow-up is due or who have never been contacted.
  - `search` (optional): Search by member name, nickname, phone number, or matric.
  - `page` (optional, default: 1)
  - `limit` (optional, default: 50)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "totalInQueue": 3,
        "highPriorityCount": 2,
        "mediumPriorityCount": 1,
        "lowPriorityCount": 0,
        "followUpDueCount": 1
      },
      "items": [
        {
          "member": {
            "id": "mem_09028872023",
            "firstName": "Charity",
            "lastName": "Ayodele",
            "otherNames": "",
            "nickname": "Cha-cha",
            "phoneNumber": "09028872023",
            "facultyDepartment": "Science",
            "matricNumber": "194012",
            "dateOfBirth": "2002-05-15",
            "judoStartDate": "2024-03-01",
            "motivation": "Self defense and fitness",
            "createdAt": "2026-01-01T00:00:00.000Z",
            "updatedAt": "2026-01-01T00:00:00.000Z"
          },
          "attendance": {
            "totalAttendance": 1,
            "attendanceInLast7Days": 0,
            "attendanceInLast30Days": 0,
            "attendanceInLast60Days": 0,
            "attendanceInLast90Days": 1,
            "lastAttendanceDate": "2026-07-01",
            "previousAttendanceDate": null,
            "daysSinceLastAttendance": 74,
            "attendanceFrequency": 0.08,
            "recentAttendanceTrend": "DECLINING"
          },
          "activityStatus": "INACTIVE",
          "lastOutreach": {
            "id": "out_init_1",
            "memberId": "mem_09028872023",
            "contactedBy": "coach@uijudo.club",
            "contactedAt": "2026-08-25T10:00:00.000Z",
            "contactMethod": "PHONE_CALL",
            "status": "RESPONDED",
            "message": "Called Charity to check in",
            "response": "She said she would be back in September",
            "nextFollowUpDate": "2026-09-01",
            "createdAt": "2026-08-25T10:00:00.000Z",
            "updatedAt": "2026-08-25T10:00:00.000Z"
          },
          "followUp": {
            "isFollowUpDue": true,
            "nextFollowUpDate": "2026-09-01",
            "daysUntilFollowUp": -12,
            "lastContactedAt": "2026-08-25T10:00:00.000Z",
            "lastContactMethod": "PHONE_CALL"
          },
          "priority": "HIGH",
          "recommendedAction": "Follow up with member"
        },
        {
          "member": {
            "id": "mem_08033334444",
            "firstName": "Victor",
            "lastName": "Oladokun",
            "otherNames": "",
            "nickname": "Vic",
            "phoneNumber": "08033334444",
            "facultyDepartment": "Technology",
            "matricNumber": "194888",
            "dateOfBirth": "2001-08-20",
            "judoStartDate": "2023-11-01",
            "motivation": "Sport",
            "createdAt": "2026-01-02T00:00:00.000Z",
            "updatedAt": "2026-01-02T00:00:00.000Z"
          },
          "attendance": {
            "totalAttendance": 8,
            "attendanceInLast7Days": 0,
            "attendanceInLast30Days": 8,
            "attendanceInLast60Days": 8,
            "attendanceInLast90Days": 8,
            "lastAttendanceDate": "2026-08-20",
            "previousAttendanceDate": "2026-08-18",
            "daysSinceLastAttendance": 24,
            "attendanceFrequency": 0.62,
            "recentAttendanceTrend": "DECLINING"
          },
          "activityStatus": "RECENTLY_INACTIVE",
          "lastOutreach": null,
          "followUp": {
            "isFollowUpDue": false,
            "nextFollowUpDate": null,
            "daysUntilFollowUp": null,
            "lastContactedAt": null,
            "lastContactMethod": null
          },
          "priority": "HIGH",
          "recommendedAction": "Contact member"
        },
        {
          "member": {
            "id": "mem_07011112222",
            "firstName": "John",
            "lastName": "Doe",
            "otherNames": "",
            "nickname": "Johnny",
            "phoneNumber": "07011112222",
            "facultyDepartment": "Arts",
            "matricNumber": "201999",
            "dateOfBirth": "2003-01-01",
            "judoStartDate": "2026-01-01",
            "motivation": "Fitness",
            "createdAt": "2026-01-03T00:00:00.000Z",
            "updatedAt": "2026-01-03T00:00:00.000Z"
          },
          "attendance": {
            "totalAttendance": 0,
            "attendanceInLast7Days": 0,
            "attendanceInLast30Days": 0,
            "attendanceInLast60Days": 0,
            "attendanceInLast90Days": 0,
            "lastAttendanceDate": null,
            "previousAttendanceDate": null,
            "daysSinceLastAttendance": null,
            "attendanceFrequency": 0,
            "recentAttendanceTrend": "NO_ATTENDANCE"
          },
          "activityStatus": "NEVER_ATTENDED",
          "lastOutreach": null,
          "followUp": {
            "isFollowUpDue": false,
            "nextFollowUpDate": null,
            "daysUntilFollowUp": null,
            "lastContactedAt": null,
            "lastContactMethod": null
          },
          "priority": "MEDIUM",
          "recommendedAction": "Contact member"
        }
      ],
      "meta": {
        "total": 3,
        "page": 1,
        "limit": 50,
        "totalPages": 1
      }
    }
  }
  ```

#### `GET /api/outreach/:id`
Fetch a specific outreach record by its unique identifier.

- **Authentication**: Required (`uijudo.sid` session cookie)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "outreach-1726218000000-123",
      "memberId": "mem_09028872023",
      "contactedBy": "Coach Musa",
      "contactedAt": "2026-09-12T10:30:00.000Z",
      "contactMethod": "WHATSAPP",
      "status": "RESPONDED",
      "message": "Checked in regarding absence from Friday training.",
      "response": "Member had exams, planning to resume next Friday.",
      "nextFollowUpDate": "2026-09-19",
      "createdAt": "2026-09-12T10:30:00.000Z",
      "updatedAt": "2026-09-12T10:35:00.000Z"
    }
  }
  ```

#### `POST /api/outreach`
Log a contact attempt or follow-up with a member.

- **Authentication**: Required (`uijudo.sid` session cookie)
- **Request Body**:
  ```json
  {
    "memberId": "mem_08033334444",
    "contactMethod": "WHATSAPP",
    "status": "CONTACTED",
    "message": "Reached out to ask how recovery is going after sprain.",
    "nextFollowUpDate": "2026-09-25"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "outreach-1726219999000-456",
      "memberId": "mem_08033334444",
      "contactedBy": "Coach Musa",
      "contactedAt": "2026-09-13T09:30:00.000Z",
      "contactMethod": "WHATSAPP",
      "status": "CONTACTED",
      "message": "Reached out to ask how recovery is going after sprain.",
      "response": null,
      "nextFollowUpDate": "2026-09-25",
      "createdAt": "2026-09-13T09:30:00.000Z",
      "updatedAt": "2026-09-13T09:30:00.000Z"
    }
  }
  ```

#### `PATCH /api/outreach/:id`
Update an existing outreach log with member feedback, updated status, or a revised follow-up date.

- **Authentication**: Required (`uijudo.sid` session cookie)
- **Request Body**:
  ```json
  {
    "status": "WILL_RETURN",
    "response": "Member is fully recovered and will attend Tuesday evening session.",
    "nextFollowUpDate": null
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "outreach-1726219999000-456",
      "memberId": "mem_08033334444",
      "contactedBy": "Coach Musa",
      "contactedAt": "2026-09-13T09:30:00.000Z",
      "contactMethod": "WHATSAPP",
      "status": "WILL_RETURN",
      "message": "Reached out to ask how recovery is going after sprain.",
      "response": "Member is fully recovered and will attend Tuesday evening session.",
      "nextFollowUpDate": null,
      "createdAt": "2026-09-13T09:30:00.000Z",
      "updatedAt": "2026-09-13T09:45:00.000Z"
    }
  }
  ```

#### `GET /api/members/:id/outreach`
Retrieve the full chronological history of outreach contacts made to a specific member.

- **Authentication**: Required (`uijudo.sid` session cookie)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "memberId": "mem_09028872023",
      "totalOutreach": 1,
      "lastContactedAt": "2026-08-25T10:00:00.000Z",
      "items": [
        {
          "id": "out_init_1",
          "memberId": "mem_09028872023",
          "contactedBy": "coach@uijudo.club",
          "contactedAt": "2026-08-25T10:00:00.000Z",
          "contactMethod": "PHONE_CALL",
          "status": "RESPONDED",
          "message": "Called Charity to check in",
          "response": "She said she would be back in September",
          "nextFollowUpDate": "2026-09-01",
          "createdAt": "2026-08-25T10:00:00.000Z",
          "updatedAt": "2026-08-25T10:00:00.000Z"
        }
      ]
    }
  }
  ```

---

## 3. Inactivity Detection & Outreach Ranking Algorithm

### 1. Activity Classification Logic
Dates are evaluated against the current calendar day in `Africa/Lagos` timezone. Only `PRESENT` attendance records are counted:

1. **`NEVER_ATTENDED`**: Member has 0 `PRESENT` attendance records (`totalAttendance === 0` or `lastAttendanceDate === null`).
2. **`ACTIVE`**: Days since last attendance $\le$ `ACTIVE_DAYS` (default: 14 days).
3. **`RECENTLY_INACTIVE`**: Days since last attendance is between 15 and `RECENTLY_INACTIVE_DAYS` (default: 30 days).
4. **`INACTIVE`**: Days since last attendance is between 31 and `LONG_TERM_INACTIVE_DAYS` (default: 90 days).
5. **`LONG_TERM_INACTIVE`**: Days since last attendance is $> 90$ days.

All thresholds are configurable via environment variables (`ACTIVE_DAYS`, `RECENTLY_INACTIVE_DAYS`, `INACTIVE_DAYS`, `LONG_TERM_INACTIVE_DAYS`).

### 2. Outreach Relevance Ranking
Members are scored and ranked to maximize retention impact:
- **Tier 1 — `RECENTLY_INACTIVE` (Base Score: 10,000)**: These members recently drifted away and have the highest chance of returning if contacted promptly. Prioritized by highest historical attendance count (`attendanceCount * 20`) minus elapsed days.
- **Tier 2 — `INACTIVE` (Base Score: 5,000)**: Secondary retention tier.
- **Tier 3 — `NEVER_ATTENDED` (Base Score: 2,500)**: Onboarding/welcome follow-ups for registered members who have not yet shown up to a training session.
- **Tier 4 — `LONG_TERM_INACTIVE` (Base Score: 1,000)**: Re-engagement campaigns for long-term absences.
- **`ACTIVE` (Score: 0)**: Excluded from inactive outreach.

---

## 4. How to Import the Postman Collection

1. Open Postman.
2. Click **Import** (top left).
3. Drag and drop [`backend/postman_collection.json`](../postman_collection.json).
4. The collection **UI Judo Club Attendance & Outreach API** will appear in your sidebar with all folders (`Health`, `Auth`, `Members`, `Attendance`, `Dashboard`) and pre-configured variables (`baseUrl`, `memberId`, `attendanceId`).
