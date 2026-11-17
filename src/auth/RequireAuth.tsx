import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

export function RequireAuth() {
  const { user, loading, error } = useAuth()
  if (loading) return <p className="auth-notice" role="status">Checking your session…</p>
  if (error) return <section className="auth-notice"><p role="alert">{error}</p><Link className="button" to="/auth/login">Go to sign in</Link></section>
  return user ? <Outlet /> : <Navigate to="/auth/login" replace />
}

export function RequireAdmin() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [check, setCheck] = useState<{ key: string; allowed: boolean; message: string } | null>(null)
  const key = `${user?.id}:${pathname}`
  useEffect(() => {
    let active = true
    // Preserve drafts while rechecking the same user and route in the background.
    setCheck(previous => previous?.key === key ? previous : null)
    const verify = async () => {
      try {
        if (!supabase || !user) throw new Error('unavailable')
        const { data, error } = await supabase.rpc('is_admin')
        if (error) throw error
        if (active) setCheck({ key, allowed: data === true, message: 'This account does not have staff access.' })
      } catch {
        if (active) setCheck({ key, allowed: false, message: 'Staff access could not be verified. Check your connection or ask the project owner to complete the database setup.' })
      }
    }
    void verify()
    return () => { active = false }
  }, [key, user])
  if (!check || check.key !== key) return <p className="auth-notice" role="status">Checking staff access…</p>
  if (!check.allowed) return <section className="auth-notice"><h1>Admin access unavailable</h1><p role="alert">{check.message}</p><Link className="button" to="/customer/dashboard">Back to your garden</Link></section>
  return <Outlet />
}
