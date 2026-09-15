# Deployment Guide

This guide details how to deploy the University of Ibadan Judo Club Attendance and Member Outreach System backend in production environments (e.g. Render, Fly.io, Railway, DigitalOcean, AWS, or on-premise VPS).

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (`v20.x LTS` recommended)
- **npm**: `v9.x` or higher
- **Google Cloud Platform Project** with:
  - Google Sheets API enabled
  - Google OAuth 2.0 Client Credentials configured
  - Google Service Account created and key downloaded (or Sheets API authorized)
- **Google Sheet** containing:
  - Form Responses tab (Members)
  - `Attendance` tab (will be automatically created if not present)
  - `Outreach` tab (will be automatically created if not present)

---

## 2. Environment Variables Configuration

Create a `.env` file on your production host (or set these in your hosting provider's environment settings dashboard):

| Variable | Description | Example / Recommended Value | Required |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application environment mode | `production` | Yes |
| `PORT` | HTTP port the server listens on | `3000` (or host assigned `$PORT`) | Yes |
| `FRONTEND_URL` | The public URL of the React frontend | `https://judo.ui.edu.ng` | Yes |
| `SESSION_SECRET` | Strong cryptographic secret for session signing | 64+ char random hex string | Yes |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web Client ID from GCP | `xxxxx.apps.googleusercontent.com` | Yes |
| `GOOGLE_CLIENT_SECRET`| OAuth 2.0 Web Client Secret from GCP | `GOCSPX-xxxxxxxxxxxx` | Yes |
| `GOOGLE_CALLBACK_URL` | Full backend OAuth callback URL | `https://api.judo.ui.edu.ng/api/auth/google/callback` | Yes |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account email address | `judo-attendance-sync@project.iam.gserviceaccount.com` | Yes |
| `GOOGLE_PRIVATE_KEY` | RSA Private Key for the Service Account | `"-----BEGIN PRIVATE KEY-----\nMIIEvgIB...-----END PRIVATE KEY-----\n"` | Yes |
| `GOOGLE_SHEETS_SPREADSHEET_ID`| Spreadsheet ID extracted from the Google Sheets URL | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` | Yes |
| `GOOGLE_SHEETS_MEMBERS_RANGE` | Sheet tab and cell range for member registrations | `'Form Responses 1'!A:Z` | Yes |
| `GOOGLE_SHEETS_ATTENDANCE_RANGE` | Sheet tab and cell range for attendance logs | `Attendance!A:Z` | No (default: `Attendance!A:Z`) |
| `GOOGLE_SHEETS_OUTREACH_RANGE` | Sheet tab and cell range for outreach logs | `Outreach!A:Z` | No (default: `Outreach!A:Z`) |
| `ALLOWED_STAFF_EMAILS` | Comma-separated list of authorized staff emails | `sensei@ui.edu.ng,coach@gmail.com` | No (empty = any Google user) |
| `ACTIVE_DAYS` | Threshold days to classify member as Active | `14` | No (default: 14) |
| `RECENTLY_INACTIVE_DAYS` | Threshold days to classify member as Recently Inactive | `30` | No (default: 30) |
| `INACTIVE_DAYS` | Threshold days to classify member as Inactive | `60` | No (default: 60) |
| `LONG_TERM_INACTIVE_DAYS` | Threshold days to classify member as Long-Term Inactive | `90` | No (default: 90) |

---

## 3. Google Cloud Setup

### 3.1 Google OAuth Credentials
1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials** → **OAuth client ID** → **Web application**.
3. Under **Authorized JavaScript origins**, add:
   - Your frontend URL: `https://judo.ui.edu.ng`
   - Your backend URL: `https://api.judo.ui.edu.ng`
4. Under **Authorized redirect URIs**, add:
   - `https://api.judo.ui.edu.ng/api/auth/google/callback`
5. Copy the **Client ID** and **Client Secret** into your `.env`.

### 3.2 Service Account & Sheet Sharing
1. In Google Cloud Console, navigate to **IAM & Admin** → **Service Accounts**.
2. Click **Create Service Account** (e.g. `judo-sheet-editor`).
3. Click on the created account, go to **Keys** → **Add Key** → **Create new key** → **JSON**.
4. Extract `client_email` and `private_key` from the downloaded JSON and set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`.
5. Open your Google Sheet in a browser, click **Share**, and grant the Service Account email (`judo-sheet-editor@...`) **Editor** permissions.

---

## 4. Production Security & Cookie Configuration

In `src/main.ts`, the backend automatically configures secure cookies when `NODE_ENV=production`:
- `secure: true` (Requires HTTPS; the cookie will only be transmitted over secure encrypted connections).
- `sameSite: process.env.NODE_ENV === 'production' ? 'lax' : false` (Protects against CSRF attacks).
- If your frontend and backend run on different domains (e.g. `frontend.com` and `backend.com`), configure `sameSite: 'none'` and ensure HTTPS is active on both.

### Reverse Proxy & Trust Proxy
If deploying behind a reverse proxy (such as Nginx, Cloudflare, Traefik, or AWS ALB):
Ensure the proxy passes:
- `X-Forwarded-For`
- `X-Forwarded-Proto: https`
- `X-Forwarded-Host`

---

## 5. Build and Run

### Step 1: Install Dependencies
```bash
npm ci --only=production=false
```

### Step 2: Build Production Artifacts
```bash
npm run build
```
This compiles TypeScript into optimized JavaScript in the `dist/` directory.

### Step 3: Run the Application
```bash
npm run start:prod
```

Or run with PM2 for process monitoring and automatic restarts:
```bash
npx pm2 start dist/src/main.js --name "uijudo-backend" -i max
```

---

## 6. Health & Verification

Once deployed, verify that the service is running:

```bash
curl -i https://api.judo.ui.edu.ng/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-09-13T10:00:00.000Z",
    "uptime": 12.4,
    "environment": "production"
  }
}
```

Swagger API documentation is available at:
`https://api.judo.ui.edu.ng/api/docs`
