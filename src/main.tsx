import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-600.css'
import '@fontsource/merriweather/latin-700-italic.css'
import './styles.css'

registerSW({
  immediate: true,
  onRegisterError(error: unknown) { console.error('Offline support could not be registered.', error) },
})

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
