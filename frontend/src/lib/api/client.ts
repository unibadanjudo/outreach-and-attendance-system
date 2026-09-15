const rawBase = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
export const BASE_URL = rawBase.endsWith('/api')
  ? rawBase
  : rawBase === '' || rawBase === '/'
    ? '/api'
    : `${rawBase.replace(/\/+$/, '')}/api`;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message?: string;
    statusCode?: number;
  };
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure session cookies (uijudo.sid) are transmitted
  });

  if (response.status === 401) {
    // Notify window for session expiry
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid server response (${response.status})`);
  }

  if (!response.ok || !body.success) {
    const errorMsg = body?.error?.message || `Request failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return body.data;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
