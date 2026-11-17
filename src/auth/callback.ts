import { supabase } from '../lib/supabase'

let completion: Promise<string> | undefined
// A single exchange also survives React StrictMode's effect remount.
export function completeAuthCallback(): Promise<string> {
  if (completion) return completion
  completion = (async () => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const fragment = new URLSearchParams(url.hash.slice(1))
    const failed = url.searchParams.has('error') || fragment.has('error')
    if (!code && !failed) return ''
    const failure = 'This email link is invalid or expired. Request a new link and open it in the same browser and device.'
    try {
      if (failed || !supabase) return failure
      const { error } = await supabase.auth.exchangeCodeForSession(code!)
      return error ? failure : ''
    } catch {
      return 'The email link could not be verified. Check your connection and request a new link.'
    } finally {
      // Remove one-time codes and provider errors from browser history.
      for (const name of ['code', 'auth', 'error', 'error_code', 'error_description']) url.searchParams.delete(name)
      if (fragment.has('error')) url.hash = '/auth/reset'
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    }
  })()
  return completion
}
