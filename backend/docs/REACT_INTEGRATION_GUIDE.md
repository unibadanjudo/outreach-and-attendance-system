# React Frontend Integration Guide

This guide describes how to integrate the React frontend with the University of Ibadan Judo Club Attendance and Member Outreach System NestJS backend.

---

## 1. Security & Architecture Foundation

### ⚠️ Critical Security Rules
1. **Never Expose Backend Secrets**:
   - Google Service Account keys, OAuth Client Secrets, and Session Secrets are strictly private to the backend server.
   - The React frontend connects **only** to the backend REST API (`http://localhost:3000/api` in development or `https://api.yourdomain.com/api` in production).
   - The frontend never communicates directly with the Google Sheets API or Google Drive.
2. **Cookie-Based Sessions**:
   - Authentication is maintained using an HTTP-only session cookie named `uijudo.sid`.
   - In production, this cookie is marked `HttpOnly`, `Secure` (HTTPS only), and `SameSite=lax` (or `none` for cross-site deployments).
   - Because cookies are `HttpOnly`, JavaScript cannot and should not read or tamper with the session token.

---

## 2. HTTP Client Configuration

To ensure cookies are sent with every request and accepted on login, you must configure credentials:

### Using Fetch
```typescript
// src/lib/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data: T }> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // CRITICAL: ensures session cookies are transmitted
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    const message = body?.error?.message || 'An unexpected error occurred';
    throw new Error(message);
  }

  return body;
}
```

### Using Axios
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // CRITICAL: sends uijudo.sid cookie across requests
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 3. Standard API Envelope

All backend endpoints adhere strictly to this response envelope:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "statusCode": 401,
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please log in via /api/auth/google."
  }
}
```

---

## 4. Authentication Flow

### Flow Overview
1. **Login Trigger**: When an unauthenticated user clicks "Sign In with Google", navigate window location to:
   ```typescript
   window.location.href = `${API_BASE_URL}/auth/google`;
   ```
2. **Google OAuth & Redirect**: The user authenticates with Google. The backend receives the callback, creates a session, sets the `uijudo.sid` cookie, and redirects the browser back to:
   ```
   http://localhost:5173/auth/callback?status=success
   ```
3. **Session Verification**: The frontend callback page calls `GET /api/auth/profile` or `GET /api/auth/status` to load the authenticated user, then navigates to the Dashboard.
4. **Logout**: Frontend calls `POST /api/auth/logout`. The session cookie is invalidated.

---

## 5. React Hooks Reference Implementation

### `useAuth` Hook
```typescript
// src/lib/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<UserProfile>('/auth/profile');
      setUser(res.data);
    } catch (err: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    refreshProfile: fetchProfile,
  };
}
```

---

### `useMembers` Hook
```typescript
// src/lib/hooks/useMembers.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  facultyDepartment: string;
  matricOrStaffId?: string;
  membershipStatus?: string;
}

export interface MembersResponse {
  items: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useMembers(page = 1, limit = 50, search = '') {
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      });
      const res = await apiClient<MembersResponse>(`/members?${query}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  return { data, loading, error, refetch: loadMembers };
}
```

---

### `useAttendance` Hook
```typescript
// src/lib/hooks/useAttendance.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface AttendanceRecord {
  id: string;
  memberId: string;
  attendanceDate: string;
  trainingSession: 'TUESDAY' | 'THURSDAY' | 'SATURDAY' | 'SPECIAL';
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface RecordAttendancePayload {
  memberId: string;
  attendanceDate: string;
  trainingSession: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  notes?: string;
}

export function useAttendance(filters: { date?: string; memberId?: string } = {}) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (filters.date) query.set('date', filters.date);
      if (filters.memberId) query.set('memberId', filters.memberId);

      const res = await apiClient<AttendanceRecord[]>(`/attendance?${query}`);
      setRecords(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.date, filters.memberId]);

  const recordAttendance = async (payload: RecordAttendancePayload) => {
    const res = await apiClient<AttendanceRecord>('/attendance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadAttendance();
    return res.data;
  };

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  return { records, loading, error, recordAttendance, refetch: loadAttendance };
}
```

---

### `useOutreachQueue` Hook
```typescript
// src/lib/hooks/useOutreachQueue.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface QueueItem {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    facultyDepartment: string;
  };
  priorityScore: number;
  activityStatus: string;
  daysInactive: number | null;
  totalAttendance: number;
  recommendedAction: string;
  isFollowUpDue: boolean;
  nextFollowUpDate: string | null;
}

export interface QueueResponse {
  summary: {
    totalInQueue: number;
    highPriorityCount: number;
    followUpDueCount: number;
    recommendedTodayCount: number;
  };
  items: QueueItem[];
}

export function useOutreachQueue(filters: { status?: string; minPriority?: number } = {}) {
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (filters.status) query.set('status', filters.status);
      if (filters.minPriority) query.set('minPriority', String(filters.minPriority));

      const res = await apiClient<QueueResponse>(`/outreach/queue?${query}`);
      setQueue(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.minPriority]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return { queue, loading, error, refetch: loadQueue };
}
```

---

### `useDashboard` Hook
```typescript
// src/lib/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  recentlyInactiveMembers: number;
  inactiveMembers: number;
  longTermInactiveMembers: number;
  neverAttendedMembers: number;
  membersRequiringOutreach: number;
  outreachCompleted: number;
  outreachPending: number;
  followUpsDue: number;
  recentAttendance: number;
  attendanceTrends: {
    increasing: number;
    stable: number;
    declining: number;
    noAttendance: number;
  };
}

export interface DashboardAttendance {
  totalRecords: number;
  totalPresent: number;
  attendanceLast7Days: number;
  attendanceLast30Days: number;
  sessionBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  dailyAttendanceLast14Days: Array<{ date: string; count: number }>;
  averageAttendancePerSession: number;
}

export interface DashboardOutreach {
  totalOutreach: number;
  pendingOutreach: number;
  completedOutreach: number;
  followUpsDue: number;
  contactMethodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  membersReturnedAfterOutreach: number;
  returnConversionRate: number;
}

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [attendance, setAttendance] = useState<DashboardAttendance | null>(null);
  const [outreach, setOutreach] = useState<DashboardOutreach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, attRes, outRes] = await Promise.all([
        apiClient<DashboardSummary>('/dashboard/summary'),
        apiClient<DashboardAttendance>('/dashboard/attendance'),
        apiClient<DashboardOutreach>('/dashboard/outreach'),
      ]);
      setSummary(sumRes.data);
      setAttendance(attRes.data);
      setOutreach(outRes.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    summary,
    attendance,
    outreach,
    loading,
    error,
    refetch: loadDashboardData,
  };
}
```

---

## 6. Route-Level Error Handling & Rate Limiting

- If the backend returns `401 Unauthorized`, clear local authentication state and redirect the user to `/login`.
- If the backend returns `429 Too Many Requests` (the backend includes a sliding-window rate limiter of 120 requests/minute), display a user-friendly toast message: *"Too many requests. Please wait a moment before trying again."*
