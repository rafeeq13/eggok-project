export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Authenticated fetch wrapper for admin API calls */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = { ...authHeaders(), ...(options.headers as Record<string, string> || {}) };
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Token expired or invalid - redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
      window.location.href = '/';
    }
  }

  return res;
}

/** Logout: clear tokens and redirect */
export function adminLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    window.location.href = '/';
  }
}
