import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { completeAuthCallback } from './callback'

type AuthState = { user: User | null; loading: boolean; error: string }
const AuthContext = createContext<AuthState>({ user: null, loading: true, error: '' })
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: '' })
  useEffect(() => {
    const client = supabase
    if (!client) {
      setState({ user: null, loading: false, error: 'Sign-in is not configured yet. Please contact Pepps & Toms.' })
      return
    }
    let active = true
    let revision = 0
    const verify = async () => {
      const current = ++revision
      // Keep local screen drafts mounted during background revalidation.
      setState(previous => previous.user ? previous : { user: null, loading: true, error: '' })
      try {
        const callbackError = await completeAuthCallback()
        const { data, error } = await client.auth.getSession()
        if (error) throw error
        const result = data.session ? await client.auth.getUser() : null
        if (result?.error) throw result.error
        if (active && current === revision) setState({ user: result?.data.user ?? null, loading: false, error: data.session ? '' : callbackError })
      } catch {
        if (active && current === revision) setState({ user: null, loading: false, error: 'Unable to verify your session. Check your connection, then sign in again.' })
      }
    }
    // Run asynchronous auth calls outside Supabase's auth-event callback lock.
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      revision++
      setState(previous => event !== 'SIGNED_OUT' && previous.user?.id === session?.user.id
        ? previous
        : { user: null, loading: true, error: '' })
      queueMicrotask(() => { if (active) void verify() })
    })
    void verify()
    const onFocus = () => { void verify() }
    window.addEventListener('focus', onFocus)
    return () => { active = false; revision++; subscription.unsubscribe(); window.removeEventListener('focus', onFocus) }
  }, [])
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
