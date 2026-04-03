/**
 * Base API client — swap VITE_API_URL in .env to point at a real backend.
 * All services should import from here instead of calling fetch directly.
 *
 * Token storage: auth tokens are stored under 'auth_token' in localStorage.
 * Swap to httpOnly cookies on the server side when moving to production.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

export const TOKEN_KEY = 'auth_token'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body?.message ?? message
    } catch { /* non-JSON body */ }
    throw new ApiError(res.status, message)
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {} as T

  return res.json() as Promise<T>
}

export const apiClient = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)     => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)     => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),
}
