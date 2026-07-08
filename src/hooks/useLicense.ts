import { useState, useEffect } from 'react'

export type LicenseStatus = 'loading' | 'valid' | 'invalid'

export interface LicenseState {
  status: LicenseStatus
  key: string | null
  email: string | null
  expiresAt: number | null
}

const LS_KEY    = 'dfa_license_key'
const LS_EXPIRY = 'dfa_license_expiry'

export function useLicense() {
  const [state, setState] = useState<LicenseState>({
    status: 'loading', key: null, email: null, expiresAt: null,
  })

  useEffect(() => {
    const key    = localStorage.getItem(LS_KEY)
    const expiry = localStorage.getItem(LS_EXPIRY)

    if (!key) { setState({ status: 'invalid', key: null, email: null, expiresAt: null }); return }

    const expNum = expiry ? parseInt(expiry, 10) : 0
    if (expNum && expNum < Math.floor(Date.now() / 1000)) {
      setState({ status: 'invalid', key: null, email: null, expiresAt: expNum })
      return
    }

    // Trust localStorage for now; re-validate in background
    setState({ status: 'valid', key, email: null, expiresAt: expNum || null })

    fetch(`/api/check-license?key=${encodeURIComponent(key)}`)
      .then(r => r.json())
      .then((data: { valid: boolean; email?: string; expires_at?: number }) => {
        if (data.valid) {
          if (data.expires_at) localStorage.setItem(LS_EXPIRY, String(data.expires_at))
          setState({ status: 'valid', key, email: data.email ?? null, expiresAt: (data.expires_at ?? expNum) || null })
        } else {
          localStorage.removeItem(LS_KEY)
          localStorage.removeItem(LS_EXPIRY)
          setState({ status: 'invalid', key: null, email: null, expiresAt: null })
        }
      })
      .catch(() => { /* stay valid — offline */ })
  }, [])

  function activate(key: string, expiresAt: number, email?: string) {
    localStorage.setItem(LS_KEY, key)
    localStorage.setItem(LS_EXPIRY, String(expiresAt))
    setState({ status: 'valid', key, email: email ?? null, expiresAt })
  }

  function logout() {
    localStorage.removeItem(LS_KEY)
    localStorage.removeItem(LS_EXPIRY)
    setState({ status: 'invalid', key: null, email: null, expiresAt: null })
    window.location.href = '/'
  }

  return { ...state, activate, logout }
}
