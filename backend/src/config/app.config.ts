import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  clubTimezone: process.env.CLUB_TIMEZONE || 'Africa/Lagos',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    sheetsSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    membersRange: process.env.GOOGLE_SHEETS_MEMBERS_RANGE || 'Members!A:Z',
    attendanceRange:
      process.env.GOOGLE_SHEETS_ATTENDANCE_RANGE || 'Attendance!A:Z',
    outreachRange: process.env.GOOGLE_SHEETS_OUTREACH_RANGE || 'Outreach!A:Z',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  auth: {
    authorizedEmails: (process.env.AUTHORIZED_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
    sessionSecret: process.env.SESSION_SECRET,
  },
  inactivity: {
    activeDays: parseInt(process.env.ACTIVE_DAYS || '14', 10),
    recentlyInactiveDays: parseInt(
      process.env.RECENTLY_INACTIVE_DAYS || '30',
      10,
    ),
    inactiveDays: parseInt(process.env.INACTIVE_DAYS || '60', 10),
    longTermInactiveDays: parseInt(
      process.env.LONG_TERM_INACTIVE_DAYS || '90',
      10,
    ),
  },
}));
