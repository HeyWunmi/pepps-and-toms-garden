import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import App from '../src/App'
import { AuthProvider } from '../src/auth/AuthProvider'
import AuthScreen from '../src/auth/AuthScreens'
import { RequireAdmin, RequireAuth } from '../src/auth/RequireAuth'

const mocks = vi.hoisted(() => ({
  configured: true,
  listener: (() => {}) as () => void,
  auth: { getSession: vi.fn(), getUser: vi.fn(), onAuthStateChange: vi.fn(), signInWithPassword: vi.fn(), signUp: vi.fn(), resetPasswordForEmail: vi.fn(), updateUser: vi.fn(), signOut: vi.fn() },
  rpc: vi.fn(),
}))
vi.mock('../src/lib/supabase', () => ({ get supabase() { return mocks.configured ? { auth: mocks.auth, rpc: mocks.rpc } : null } }))
afterEach(cleanup)
beforeEach(() => {
  mocks.configured = true
  mocks.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
  mocks.auth.getUser.mockResolvedValue({ data: { user: { id: 'customer-id', user_metadata: { role: 'admin' } } }, error: null })
  mocks.auth.onAuthStateChange.mockImplementation((listener: () => void) => { mocks.listener = listener; return { data: { subscription: { unsubscribe: vi.fn() } } } })
  for (const name of ['signInWithPassword', 'signUp', 'resetPasswordForEmail', 'updateUser', 'signOut'] as const) mocks.auth[name].mockResolvedValue({ error: null })
  mocks.rpc.mockResolvedValue({ data: false, error: null })
  window.scrollTo = vi.fn()
})
function signedIn() { mocks.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'customer-id' } } }, error: null }) }
function protectedRoute(admin = false) {
  return render(<MemoryRouter><AuthProvider><Routes>
    <Route element={<RequireAuth />}><Route element={admin ? <RequireAdmin /> : <div>Customer protected content<input aria-label="Local draft" /></div>}>
      <Route index element={<div>Admin protected content</div>} />
    </Route></Route><Route path="/auth/login" element={<div>Login destination</div>} />
  </Routes></AuthProvider></MemoryRouter>)
}
function form(mode: 'login' | 'signup' | 'reset' | 'update-password' | 'logout') {
  return render(<MemoryRouter><AuthProvider><AuthScreen mode={mode} /></AuthProvider></MemoryRouter>)
}

describe('route boundaries', () => {
  it.each([
    ...['dashboard', 'plants', 'calendar', 'reminders', 'journal', 'harvest', 'support', 'settings'].map(p => `/customer/${p}`),
    ...['overview', 'inventory', 'customers', 'calendar', 'reminders', 'assignments', 'support', 'reports'].map(p => `/admin/${p}`),
  ])('redirects signed-out visitors from %s', async path => {
    window.location.hash = path
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeTruthy()
    expect(mocks.rpc).not.toHaveBeenCalled()
  })
  it('restores a persisted session only after server verification', async () => {
    signedIn(); protectedRoute()
    expect(await screen.findByText('Customer protected content')).toBeTruthy()
    expect(mocks.auth.getUser).toHaveBeenCalled()
  })
  it('preserves local drafts across focus/session revalidation', async () => {
    signedIn(); protectedRoute()
    await screen.findByText('Customer protected content')
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Local draft'), 'Unsaved garden notes')
    act(() => window.dispatchEvent(new Event('focus')))
    await waitFor(() => expect(mocks.auth.getUser.mock.calls.length).toBeGreaterThan(1))
    expect(screen.getByLabelText('Local draft')).toHaveProperty('value', 'Unsaved garden notes')
  })
  it('rejects stale/tampered sessions', async () => {
    signedIn(); mocks.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid token') }); protectedRoute()
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.queryByText('Customer protected content')).toBeNull()
  })
  it('denies customers even with admin user metadata', async () => {
    signedIn(); protectedRoute(true)
    expect(await screen.findByText('This account does not have staff access.')).toBeTruthy()
    expect(screen.queryByText('Admin protected content')).toBeNull()
    expect(mocks.rpc).toHaveBeenCalledWith('is_admin')
  })
  it('allows staff only after the server returns true', async () => {
    signedIn(); mocks.rpc.mockResolvedValue({ data: true, error: null }); protectedRoute(true)
    expect(await screen.findByText('Admin protected content')).toBeTruthy()
  })
  it('fails closed when migration or network is unavailable', async () => {
    signedIn(); mocks.rpc.mockResolvedValue({ data: null, error: new Error('missing function') }); protectedRoute(true)
    expect(await screen.findByRole('heading', { name: 'Admin access unavailable' })).toBeTruthy()
    expect(screen.queryByText('Admin protected content')).toBeNull()
  })
  it('removes protected content after sign-out events', async () => {
    signedIn(); protectedRoute()
    await screen.findByText('Customer protected content')
    mocks.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    act(() => mocks.listener())
    expect(await screen.findByText('Login destination')).toBeTruthy()
  })
  it('shows configuration errors without rendering protected content', async () => {
    mocks.configured = false; protectedRoute()
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', expect.stringContaining('not configured'))
    expect(screen.queryByText('Customer protected content')).toBeNull()
  })
})

describe('account forms', () => {
  it('registers only credentials, with no role metadata', async () => {
    form('signup'); const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email address'), 'customer@example.test')
    await user.type(screen.getByLabelText('New password (at least 12 characters)'), 'example-password-123')
    await user.type(screen.getByLabelText('Confirm password'), 'example-password-123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(mocks.auth.signUp).toHaveBeenCalledWith({ email: 'customer@example.test', password: 'example-password-123', options: { emailRedirectTo: `${window.location.origin}/?auth=confirm` } })
    expect(await screen.findByRole('status')).toBeTruthy()
  })
  it('does not submit mismatched passwords', async () => {
    form('signup'); const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email address'), 'customer@example.test')
    await user.type(screen.getByLabelText('New password (at least 12 characters)'), 'example-password-123')
    await user.type(screen.getByLabelText('Confirm password'), 'different-password')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('The passwords do not match.')).toBeTruthy()
    expect(mocks.auth.signUp).not.toHaveBeenCalled()
  })
  it('shows failed login errors', async () => {
    mocks.auth.signInWithPassword.mockResolvedValue({ error: new Error('Invalid login credentials') })
    form('login'); const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email address'), 'customer@example.test')
    await user.type(screen.getByLabelText('Password'), 'incorrect')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Invalid login credentials')).toBeTruthy()
  })
  it('requests a PKCE reset redirect without revealing account existence', async () => {
    form('reset'); const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email address'), 'customer@example.test')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(mocks.auth.resetPasswordForEmail).toHaveBeenCalledWith('customer@example.test', { redirectTo: `${window.location.origin}/?auth=recovery` })
    expect(await screen.findByRole('status')).toHaveProperty('textContent', expect.stringContaining('If an account exists'))
  })
  it('cannot update a password without a verified session', async () => {
    form('update-password')
    await screen.findByText(/This reset link is invalid or expired/)
    expect(screen.getByRole('button', { name: 'Save password' })).toHaveProperty('disabled', true)
    expect(mocks.auth.updateUser).not.toHaveBeenCalled()
  })
  it('updates passwords through Supabase', async () => {
    signedIn(); form('update-password'); const user = userEvent.setup()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save password' })).toHaveProperty('disabled', false))
    await user.type(screen.getByLabelText('New password (at least 12 characters)'), 'replacement-password-123')
    await user.type(screen.getByLabelText('Confirm password'), 'replacement-password-123')
    await user.click(screen.getByRole('button', { name: 'Save password' }))
    expect(mocks.auth.updateUser).toHaveBeenCalledWith({ password: 'replacement-password-123' })
  })
  it('signs out this browser through Supabase', async () => {
    signedIn(); form('logout'); const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Sign out of this browser' }))
    expect(mocks.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
  })
})
