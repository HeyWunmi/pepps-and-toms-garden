import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-600.css'
import '@fontsource/merriweather/latin-700-italic.css'
import './styles.css'

// Supabase PKCE redirects use a query parameter, leaving hash routing intact.
const callbackUrl = new URL(window.location.href)
const authCallback = callbackUrl.searchParams.get('auth')
const callbackFailed = new URLSearchParams(callbackUrl.hash.slice(1)).has('error')
if (authCallback === 'recovery' || authCallback === 'confirm' || callbackFailed) {
  if (callbackFailed) callbackUrl.searchParams.set('error', 'auth_callback_failed')
  callbackUrl.hash = `/auth/${authCallback === 'recovery' ? 'update-password' : callbackFailed ? 'reset' : 'login'}`
  window.history.replaceState(null, '', `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`)
}

registerSW({
  immediate: true,
  onRegisterError(error: unknown) { console.error('Offline support could not be registered.', error) },
})

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
