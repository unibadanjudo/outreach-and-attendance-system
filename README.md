# UI Judo Club — Outreach & Attendance Management System

A full-stack, enterprise-grade web application built for the **University of Ibadan Judo Club (UI Judo)** to manage dojo memberships, track training attendance, analyze participation trends, and automate proactive member outreach to combat attrition.

---

## Table of Contents

- [1. Project Overview & Objectives](#1-project-overview--objectives)
- [2. Key Features](#2-key-features)
- [3. Architecture & Tech Stack](#3-architecture--tech-stack)
- [4. Repository Structure](#4-repository-structure)
- [5. Prerequisites & External Setup](#5-prerequisites--external-setup)
- [6. Backend Documentation & Setup](#6-backend-documentation--setup)
  - [Backend Architecture](#backend-architecture)
  - [Backend Environment Variables](#backend-environment-variables)
  - [Running the Backend](#running-the-backend)
  - [API Endpoints & Swagger](#api-endpoints--swagger)
- [7. Frontend Documentation & Setup](#7-frontend-documentation--setup)
  - [Frontend Architecture](#frontend-architecture)
  - [Frontend Environment Variables](#frontend-environment-variables)
  - [Running the Frontend](#running-the-frontend)
- [8. Authentication & Authorization Flow](#8-authentication--authorization-flow)
- [9. Testing & Quality Assurance](#9-testing--quality-assurance)
- [10. Deployment (Render & Vercel)](#10-deployment-render--vercel)
- [11. Development Guidelines & Rules](#11-development-guidelines--rules)

---

## 1. Project Overview & Objectives

### The Problem
University sports clubs often struggle with member retention and administrative overhead. Attendance records are frequently kept on ad-hoc paper sheets or scattered spreadsheets, making it difficult to detect when a judoka stops attending training until months later.

### The Solution
The **UI Judo Outreach & Attendance System** acts as a centralized operational hub:
- **Zero-Cost Persistent Storage**: Uses **Google Sheets as the database** via Google Cloud Service Accounts, meaning club executives can directly view, audit, and export data in spreadsheet format without incurring database hosting fees.
- **Automated Inactivity Detection**: Analyzes training history to flag judokas who haven't trained in 14, 30, 60, or 90+ days.
- **Actionable Outreach Workflow**: Generates prioritized outreach tasks with contact details and follow-up logging so club captains can reach out before members drop out permanently.
- **Strict Role-Based Access Control**: Ensures only authorized club coaches and executive committee members can access sensitive club data via Google OAuth.

---

## 2. Key Features

### 🥋 Member Management
- Complete judoka profiles: full name, student status, department, belt rank (White to Black), phone number, emergency contacts, and joining date.
- Search, filter by belt rank, status (Active/Inactive), and sort.
- Profile editing and soft-delete capabilities synchronized to the Google Sheets `Members` tab.

### 📋 Attendance Tracking
- Rapid session attendance check-ins directly on mobile or tablet at the dojo mat.
- Historical attendance records categorized by date and session type.
- Individual member attendance streaks, mat hours, and frequency metrics.

### 📢 Outreach & Retention Engine
- **Inactivity Tiers**:
  - `Active`: Trained within the last 14 days.
  - `Recently Inactive`: 15–30 days absent (recommended gentle check-in).
  - `Inactive`: 31–60 days absent (requires direct captain outreach).
  - `Long-Term Inactive`: 60+ days absent (re-engagement campaign).
- **Outreach Queue**: Prioritizes members based on inactivity severity.
- **Follow-up Logs**: Records communication method (Call, WhatsApp, Email, In-Person), outreach response, notes, and the staff member who reached out.

### 📊 Executive Dashboard
- High-level KPIs: Active Judokas count, weekly mat turnout, retention rate, and attendance distribution across ranks.
- Interactive attendance and growth charts powered by Recharts.

### 🔐 Security & Access Control
- Google OAuth 2.0 Single Sign-On (SSO).
- Authorization verification: Even if a user authenticates with Google, they are only granted access if their email is explicitly listed in the `AllowedUsers` tab of the Google Sheet with an active role (`admin`, `coach`, `executive`).
- Secure HTTP-only, SameSite session cookies (`uijudo.sid`).

---

## 3. Architecture & Tech Stack

```
[ Frontend: React 19 + Vite ] 
       │  HTTP / JSON + Credentials Cookie
       ▼
[ Backend: NestJS 11 + Express ]
       │  Google Auth & Service Account
       ▼
[ Google Cloud: Sheets API v4 ]
```

### Backend
- **Framework**: [NestJS 11](https://nestjs.com/) (Node.js TypeScript framework)
- **HTTP Server**: Express with `@nestjs/platform-express`
- **Authentication**: Passport.js (`passport-google-oauth20`, `@nestjs/passport`)
- **Session Management**: `express-session` with secure cookies
- **Validation**: `class-validator` and `class-transformer`
- **Data Layer**: Official `googleapis` (Sheets API v4)
- **API Documentation**: OpenAPI 3.0 / Swagger via `@nestjs/swagger`
- **Testing**: Jest with comprehensive unit and mapper test suites

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with CSS variables design tokens
- **Routing**: React Router v7 (`react-router-dom`)
- **Server State & Caching**: `@tanstack/react-query` v5
- **Forms & Validation**: `react-hook-form` + `zod` + `@hookform/resolvers`
- **Charts & Visuals**: `recharts`, `lucide-react`
- **Notifications**: `react-toastify`

---

## 4. Repository Structure

```text
UIJudo_OutreachAndAttendanceSystem/
├── .agents/                 # Architecture, engineering, and coding rules
│   └── rules/
├── backend/                 # NestJS backend application
│   ├── docs/                # Extended API and deployment documentation
│   ├── src/
│   │   ├── allowed-users/   # RBAC & allowed email authorization
│   │   ├── attendance/      # Attendance tracking, analytics, inactivity logic
│   │   ├── auth/            # Google OAuth strategy, guards, session handling
│   │   ├── common/          # Global filters, guards, interceptors, decorators
│   │   ├── config/          # Environment configuration & validation
│   │   ├── dashboard/       # Club KPI aggregation and statistics
│   │   ├── google/          # Google Sheets API client, connection & mappers
│   │   ├── health/          # Health check endpoint
│   │   ├── members/         # Member CRUD and spreadsheet repository
│   │   ├── outreach/        # Outreach tasks, queue, priority & follow-up logs
│   │   ├── app.module.ts    # Root application module
│   │   └── main.ts          # Application entry point & bootstrapping
│   ├── test/                # E2E & helper tests
│   └── package.json
├── frontend/                # React + Vite frontend application
│   ├── src/
│   │   ├── lib/             # Core frontend application logic
│   │   │   ├── api/         # Centralized API service functions
│   │   │   ├── components/  # Reusable UI components (common, layout, features)
│   │   │   ├── hooks/       # Custom React & React Query hooks
│   │   │   ├── types/       # TypeScript interfaces and contracts
│   │   │   └── utils/       # Formatting, date, and helper utilities
│   │   ├── pages/           # Application views/routes (Dashboard, Members, etc.)
│   │   ├── App.tsx          # Root router & layout wrapper
│   │   ├── index.css        # Central design system tokens & Tailwind imports
│   │   └── main.tsx         # React root mounting
│   └── package.json
├── vercel.json              # Vercel deployment routing & rewrite rules
└── README.md
```

---

## 5. Prerequisites & External Setup

Before running the application locally or in production, you will need:

1. **Node.js**: v20.x or later (LTS recommended)
2. **npm**: v10.x or later
3. **Google Cloud Project**:
   - Enable **Google Sheets API**.
   - Create a **Service Account** with access to the Google Sheets API. Download the service account JSON key.
   - Configure **OAuth 2.0 Credentials** (Web Application) for Google Sign-In:
     - Authorized JavaScript Origins: `http://localhost:5173`, `http://localhost:3000` (and your production frontend URL).
     - Authorized Redirect URIs: `http://localhost:3000/api/auth/google/callback` (and your production backend callback URL).
4. **Google Spreadsheet**:
   - Create a Google Sheet.
   - Share the spreadsheet with the Service Account email (Editor role).
   - Ensure the required sheet tabs exist: `Members`, `Attendance`, `Outreach`, and `AllowedUsers`.

---

## 6. Backend Documentation & Setup

### Backend Architecture

The backend adheres to a strict layered structure:
```text
HTTP Controller ──► Service (Business Logic) ──► Repository/Mappers ──► Google Sheets API
```
- **Controllers** remain thin: they validate input DTOs, delegate to services, and format output.
- **Services** contain authoritative business logic (inactivity calculation, outreach priority, streak tracking).
- **Google Sheets Module** handles rate limiting, cell mapping, and batch updates.
- **Files stay under 150 lines** wherever possible for maximum cohesion and maintainability.

### Backend Environment Variables

Create a file named `.env` inside the `backend/` directory (refer to `backend/.env.example`):

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CLUB_TIMEZONE=Africa/Lagos

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your-google-spreadsheet-id
GOOGLE_SHEETS_MEMBERS_RANGE=Members!A:Z
GOOGLE_SHEETS_ATTENDANCE_RANGE=Attendance!A:Z
GOOGLE_SHEETS_OUTREACH_RANGE=Outreach!A:Z
GOOGLE_SHEETS_ALLOWED_USERS_RANGE=AllowedUsers!A:F

# Google Service Account Credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvg...==\n-----END PRIVATE KEY-----\n"

# Inactivity Thresholds (in days)
ACTIVE_DAYS=14
RECENTLY_INACTIVE_DAYS=30
INACTIVE_DAYS=60
LONG_TERM_INACTIVE_DAYS=90

# Session Security
SESSION_SECRET=a-secure-random-string-at-least-32-characters-long
```

> [!IMPORTANT]
> Always include `http://` or `https://` in `FRONTEND_URL`. In production, set `FRONTEND_URL=https://your-frontend.vercel.app` without a trailing slash.

### Running the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start in development mode (with hot-reload)
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

### API Endpoints & Swagger

Once the backend is running locally, access the interactive OpenAPI documentation:
- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

Detailed request/response contracts for every endpoint can also be found in [`backend/docs/API_DOCUMENTATION.md`](backend/docs/API_DOCUMENTATION.md).

---

## 7. Frontend Documentation & Setup

### Frontend Architecture

The frontend is organized **by feature first, responsibility second**:
- `src/lib/components/`:
  - `common/`: Reusable primitives (Buttons, Modals, Inputs, Badges, Loaders).
  - `layout/`: Shell elements (Header, Sidebar, Navigation).
  - `members/`, `attendance/`, `outreach/`, `dashboard/`: Feature-specific cards, tables, filters, and forms.
- `src/lib/api/`: Centralized API calls (using Axios/fetch with credentials enabled).
- `src/lib/hooks/`: React Query custom hooks handling caching, optimistic updates, and loading states.
- `src/pages/`: Page-level route definitions.

### Frontend Environment Variables

Configure the API base URL in `frontend/.env.development` or `frontend/.env.production`:

**`frontend/.env.development`**:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**`frontend/.env.production`**:
```env
VITE_API_BASE_URL=https://outreach-and-attendance-system.onrender.com/api
```

### Running the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

The frontend will run at [http://localhost:5173](http://localhost:5173).

---

## 8. Authentication & Authorization Flow

1. **User triggers Sign-in**: Frontend redirects the browser to `${VITE_API_BASE_URL}/auth/google`.
2. **Google Consent Screen**: User authenticates with their Google Account.
3. **OAuth Callback**: Google redirects to `/api/auth/google/callback`.
4. **Authorization Check**:
   - Backend checks `AllowedUsers` tab in the Google Sheet.
   - If the user's email is found and active, an encrypted session cookie (`uijudo.sid`) is created.
   - If unauthorized, the user is redirected to `/unauthorized`.
5. **Session Success**: The user is redirected to `${FRONTEND_URL}/auth/callback?status=success`.
6. **Client Sync**: Frontend calls `/api/auth/status` or `/api/auth/me` to load the current session profile and updates React Query auth state.

---

## 9. Testing & Quality Assurance

The repository includes automated unit, validation, and integration tests across both layers.

```bash
# Backend unit & integration tests
cd backend
npm test

# Run backend tests with coverage
npm run test:cov

# Frontend linting
cd frontend
npm run lint
```

---

## 10. Deployment (Render & Vercel)

### Backend on Render (Web Service)
1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm run start:prod`
3. **Environment Variables**: Populate all variables from `backend/.env.example`.
   - Ensure `FRONTEND_URL` is set to `https://outreach-and-attendance-system-m1os.vercel.app` (with `https://`).
   - Ensure `NODE_ENV=production`.
   - On Render, reverse proxies require `expressApp.set('trust proxy', 1)` (already configured in `main.ts`).

### Frontend on Vercel
1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_BASE_URL=https://outreach-and-attendance-system.onrender.com/api`

---

## 11. Development Guidelines & Rules

All developers contributing to this codebase must adhere to the engineering standards codified in `.agents/rules/`:

1. **Layer Separation**:
   - Frontend: `Component → Hook → API → Backend`.
   - Backend: `Controller → Service → Repository → Google Sheets`.
2. **Thin Controllers & Rich Services**: Business logic (especially attendance calculation, streaks, and outreach eligibility) belongs on the backend.
3. **Single Source of Truth**:
   - Persistent data: Google Sheets.
   - Design tokens: CSS variables in `index.css`.
4. **Cohesion & File Limits**: Keep backend files under 150 lines wherever reasonably possible.
5. **Reuse Before Creating**: Check existing UI components in `lib/components/common` and utilities before writing new ones.
6. **Cross-Origin & Cookies**: Always pass `credentials: 'include'` on frontend API requests to maintain the session cookie.
