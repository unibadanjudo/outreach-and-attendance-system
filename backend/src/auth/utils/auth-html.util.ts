import { UserSession } from '../interfaces/user-session.interface';

/**
 * Generates an HTML response shown in the browser when Google OAuth
 * is completed via the Postman authentication flow (state=postman).
 */
export function renderAuthSuccessHtml(
  user: UserSession,
  cookieValue = '',
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>UI Judo Club - Authentication Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #1e293b;
      padding: 36px 32px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 500px;
      border: 1px solid #334155;
    }
    .icon { font-size: 44px; margin-bottom: 12px; }
    h2 { color: #4ade80; margin: 0 0 10px 0; font-size: 22px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 8px 0; }
    .badge {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 14px;
      margin: 16px 0;
    }
    .email { color: #38bdf8; font-weight: 600; font-size: 15px; }
    .cookie-box {
      margin: 18px 0;
      background: #0f172a;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #334155;
      text-align: left;
    }
    .cookie-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .cookie-label { font-size: 11px; color: #94a3b8; font-weight: 600; }
    .copy-btn {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
    }
    .copy-btn:hover { background: #1d4ed8; }
    code { font-size: 11px; color: #38bdf8; word-break: break-all; display: block; }
    .actions { margin-top: 20px; display: flex; gap: 12px; justify-content: center; }
    .btn {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    .btn:hover { background: #1d4ed8; }
    .btn-secondary { background: #334155; color: #cbd5e1; }
    .btn-secondary:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🥋</div>
    <h2>Authentication Successful!</h2>
    <p>You have successfully logged in to UI Judo Club System.</p>
    <div class="badge">
      <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">AUTHENTICATED USER</div>
      <div class="email">${user.name} (${user.email})</div>
      <div style="font-size: 12px; color: #a855f7; margin-top: 4px;">Role: ${user.role}</div>
    </div>
    ${
      cookieValue
        ? `<div class="cookie-box">
      <div class="cookie-header">
        <span class="cookie-label">SESSION COOKIE FOR POSTMAN</span>
        <button id="copyBtn" class="copy-btn" onclick="copyCookie()">📋 Copy Cookie</button>
      </div>
      <code id="cookieText">${cookieValue}</code>
    </div>`
        : ''
    }
    <p>Your session is active on <code>localhost</code>.<br>To test in Postman, use the copied cookie or trigger <code>dev-login</code>.</p>
    <div class="actions">
      <a class="btn" href="/api/auth/status">Check Status</a>
      <a class="btn btn-secondary" href="/api/auth/me">My Profile</a>
    </div>
  </div>
  <script>
    function copyCookie() {
      const text = document.getElementById('cookieText').innerText;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.innerText = '✅ Copied!';
        setTimeout(() => btn.innerText = '📋 Copy Cookie', 2000);
      });
    }
  </script>
</body>
</html>`;
}
