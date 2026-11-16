import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

type Mode = 'login' | 'signup' | 'reset' | 'update-password' | 'logout'
export function authRedirect(recovery = false) {
  return `${window.location.origin}${window.location.pathname}?auth=${recovery ? 'recovery' : 'confirm'}`
}
export default function AuthScreen({ mode }: { mode: Mode }) {
  const { user, loading, error: sessionError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const titles = { login: 'Welcome back', signup: 'Create your garden account', reset: 'Reset your password', 'update-password': 'Choose a new password', logout: 'Sign out' }
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!supabase || busy) return
    setError(''); setMessage('')
    if ((mode === 'signup' || mode === 'update-password') && password !== confirmation) { setError('The passwords do not match.'); return }
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        navigate('/customer/dashboard', { replace: true })
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: authRedirect() } })
        if (error) throw error
        setMessage('Check your email for a confirmation link if registration is available for this address. Open it in this browser.')
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: authRedirect(true) })
        if (error) throw error
        setMessage('If an account exists for this address, you will receive a reset link. Open it in this browser.')
      } else if (mode === 'update-password') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setMessage('Your password has been updated. You can return to your garden.')
      } else {
        const { error } = await supabase.auth.signOut({ scope: 'local' })
        if (error) throw error
        navigate('/auth/login', { replace: true })
      }
      setPassword(''); setConfirmation('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }
  const needsPassword = ['login', 'signup', 'update-password'].includes(mode)
  const needsConfirmation = mode === 'signup' || mode === 'update-password'
  const needsEmail = ['login', 'signup', 'reset'].includes(mode)
  const unavailable = !supabase || (mode === 'update-password' && (!user || loading))
  return <main className="auth-page"><section className="auth-card">
    <img className="auth-logo" src="/brand-logo.png" alt="Pepps & Toms" />
    <p className="eyebrow">GARDEN COMPANION</p><h1>{titles[mode]}</h1>
    {mode === 'signup' && <p>Create a customer account to access your garden. Staff access is assigned separately by the project owner.</p>}
    {mode === 'logout' && <p>Sign out of this browser on shared devices.</p>}
    {!supabase && <p role="alert">Sign-in is not configured yet. Please contact Pepps & Toms.</p>}
    {sessionError && supabase && <p role="alert">{sessionError}</p>}
    {mode === 'update-password' && !loading && !user && <p role="alert">This reset link is invalid or expired. Request a new link and open it in the same browser.</p>}
    <form onSubmit={submit}>
      {needsEmail && <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>}
      {needsPassword && <label>{mode === 'login' ? 'Password' : 'New password (at least 12 characters)'}<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? undefined : 12} required value={password} onChange={e => setPassword(e.target.value)} /></label>}
      {needsConfirmation && <label>Confirm password<input type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>}
      {error && <p className="photo-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
      <button className="button" disabled={busy || unavailable}>{busy ? 'Please wait…' : mode === 'reset' ? 'Send reset link' : mode === 'update-password' ? 'Save password' : mode === 'signup' ? 'Create account' : mode === 'logout' ? 'Sign out of this browser' : 'Sign in'}</button>
    </form>
    <nav aria-label="Account navigation"><Link to="/auth/login">Sign in</Link><Link to="/auth/signup">Create account</Link><Link to="/auth/reset">Forgot password?</Link>{user && <Link to="/customer/dashboard">Your garden</Link>}</nav>
  </section></main>
}
