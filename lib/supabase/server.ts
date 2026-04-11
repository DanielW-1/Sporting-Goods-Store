import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import type { Database } from '@/lib/supabase/types'

export async function createClient() {
  const cookieStore = await cookies()
  const headerStore = await headers()

  // Prefer Bearer token from Authorization header (e.g. Postman / API clients)
  // over the session cookie so that the correct user is always resolved.
  const authHeader = headerStore.get('authorization') ?? headerStore.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
      },
      cookies: {
        getAll() {
          // When a Bearer token is present, ignore cookies entirely so the
          // cookie session cannot override the explicitly supplied token.
          return bearerToken ? [] : cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          if (bearerToken) return
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore
          }
        },
      },
    }
  )
}
