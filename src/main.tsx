import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LandingPage } from './components/LandingPage'
import './index.css'

function Root() {
  const path = window.location.pathname

  if (path.startsWith('/app')) {
    const email  = localStorage.getItem('dfa_email')
    const expiry = localStorage.getItem('dfa_expiry')
    const valid  = email && expiry && parseInt(expiry, 10) > Math.floor(Date.now() / 1000)

    if (!valid) { window.location.replace('/'); return null }

    return <App />
  }

  return <LandingPage onActivated={() => { window.location.href = '/app' }} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><Root /></React.StrictMode>
)
