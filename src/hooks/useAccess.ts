import { useState, useEffect } from 'react'

export type AccessStatus = 'loading' | 'approved' | 'denied'

export interface AccessState {
  status:    AccessStatus
  email:     string | null
  deviceId:  string | null
  expiresAt: number | null
}

const LS_EMAIL  = 'dfa_email'
const LS_DEVICE = 'dfa_device_id'
const LS_EXPIRY = 'dfa_expiry'

export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(LS_DEVICE)
  if (!id) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
    id = 'DFA-' + Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    localStorage.setItem(LS_DEVICE, id)
  }
  return id
}

export function useAccess() {
  const [state, setState] = useState<AccessState>({
    status: 'loading', email: null, deviceId: null, expiresAt: null,
  })

  useEffect(() => {
    const email    = localStorage.getItem(LS_EMAIL)
    const deviceId = getOrCreateDeviceId()
    const expiry   = localStorage.getItem(LS_EXPIRY)
    const expNum   = expiry ? parseInt(expiry, 10) : 0

    if (!email) {
      setState({ status: 'denied', email: null, deviceId, expiresAt: null })
      return
    }

    if (expNum && expNum < Math.floor(Date.now() / 1000)) {
      setState({ status: 'denied', email, deviceId, expiresAt: expNum })
      return
    }

    // Trust localStorage; verify server-side in background
    setState({ status: 'approved', email, deviceId, expiresAt: expNum || null })

    fetch(`/api/check-access?email=${encodeURIComponent(email)}&device=${encodeURIComponent(deviceId)}`)
      .then(r => r.json())
      .then((data: { status: string; expires_at?: number }) => {
        if (data.status === 'approved') {
          if (data.expires_at) localStorage.setItem(LS_EXPIRY, String(data.expires_at))
          setState({ status: 'approved', email, deviceId, expiresAt: (data.expires_at ?? expNum) || null })
        } else {
          localStorage.removeItem(LS_EMAIL)
          localStorage.removeItem(LS_EXPIRY)
          setState({ status: 'denied', email: null, deviceId, expiresAt: null })
          window.location.href = '/'
        }
      })
      .catch(() => { /* offline — stay approved */ })
  }, [])

  function grant(email: string, expiresAt: number) {
    localStorage.setItem(LS_EMAIL,  email)
    localStorage.setItem(LS_EXPIRY, String(expiresAt))
    setState({ status: 'approved', email, deviceId: getOrCreateDeviceId(), expiresAt })
  }

  function logout() {
    localStorage.removeItem(LS_EMAIL)
    localStorage.removeItem(LS_EXPIRY)
    // keep device ID so they don't need to re-register on next payment
    setState({ status: 'denied', email: null, deviceId: state.deviceId, expiresAt: null })
    window.location.href = '/'
  }

  return { ...state, grant, logout }
}
