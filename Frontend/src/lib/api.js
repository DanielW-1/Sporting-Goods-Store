class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function apiFetch(endpoint, options = {}) {
  const BASE_URL = import.meta.env.VITE_API_URL ?? ''
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}/api${endpoint}`

  const { supabase } = await import('./supabase')
  const { data: { session } } = await supabase.auth.getSession()
  const authHeader = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
    credentials: 'include',
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(res.status, data.error || data.message || 'Something went wrong')
  }

  return data
}

export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
}