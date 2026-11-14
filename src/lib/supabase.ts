import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function createOptionalClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !publishableKey) return null

  try {
    return createClient(url, publishableKey, {
      // Authentication is not connected yet; avoid session storage or URL handling.
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  } catch {
    // Invalid local configuration must not prevent the public preview loading.
    return null
  }
}

// Future data adapters must check for null before using the client.
// Creating this client does not query or upload any preview data.
export const supabase = createOptionalClient()
