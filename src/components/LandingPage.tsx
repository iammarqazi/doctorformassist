import { useState, useRef, useEffect } from 'react'
import { getOrCreateDeviceId } from '@/hooks/useAccess'
import styles from './LandingPage.module.css'

const UPI_ID = import.meta.env.VITE_UPI_ID   || ''
const WA_NUM = import.meta.env.VITE_WHATSAPP || '919999999999'
const AMOUNT = 365

const upiLink = UPI_ID
  ? `upi://pay?pa=${UPI_ID}&pn=DoctorFormAssist&am=${AMOUNT}&cu=INR&tn=DoctorFormAssist+Annual`
  : '#'

type CheckState =
  | 'idle'        // waiting for email input
  | 'checking'    // API call in flight
  | 'not_found'   // new email — show payment section
  | 'new_device'  // email exists but this device not registered
  | 'expired'     // subscription lapsed
  | 'error'

interface LandingPageProps {
  onActivated: () => void
}

export function LandingPage({ onActivated }: LandingPageProps) {
  const [email,           setEmail]           = useState('')
  const [state,           setState]           = useState<CheckState>('idle')
  const [errMsg,          setErrMsg]          = useState('')
  const [copied,          setCopied]          = useState(false)
  const [screenshot,      setScreenshot]      = useState<File | null>(null)
  const [screenshotUrl,   setScreenshotUrl]   = useState<string | null>(null)
  const deviceId    = useRef(getOrCreateDeviceId())
  const payRef      = useRef<HTMLDivElement>(null)
  const emailRef    = useRef<HTMLInputElement>(null)
  const fileRef     = useRef<HTMLInputElement>(null)

  useEffect(() => { emailRef.current?.focus() }, [])

  function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl)
    setScreenshot(file)
    setScreenshotUrl(URL.createObjectURL(file))
  }

  async function checkAccess() {
    const e = email.trim().toLowerCase()
    if (!e || !e.includes('@')) { setErrMsg('Enter a valid email address.'); return }
    setErrMsg('')
    setScreenshot(null)
    setScreenshotUrl(null)
    setState('checking')
    try {
      const res  = await fetch(
        `/api/check-access?email=${encodeURIComponent(e)}&device=${encodeURIComponent(deviceId.current)}`
      )
      const data = await res.json() as { status: string; expires_at?: number }

      if (data.status === 'approved') {
        localStorage.setItem('dfa_email',  e)
        localStorage.setItem('dfa_expiry', String(data.expires_at ?? 0))
        onActivated()
        return
      }
      setState(data.status as CheckState)
      if (data.status === 'not_found' || data.status === 'new_device') {
        setTimeout(() => payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
      }
    } catch {
      setErrMsg('Could not connect. Check your internet and try again.')
      setState('error')
    }
  }

  function copyUpi() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  function openWhatsApp(forNewDevice = false) {
    const e   = email.trim()
    const msg = forNewDevice
      ? `Hi, I need to add a new device to DoctorFormAssist.\nEmail: ${e}\nDevice ID: ${deviceId.current}`
      : `Hi, I've paid ₹${AMOUNT} for DoctorFormAssist. Please activate my account.\nEmail: ${e}\nDevice ID: ${deviceId.current}\n\n(Payment screenshot attached)`
    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function UpiPaymentPanel({ forRenewal = false }: { forRenewal?: boolean }) {
    return (
      <>
        <div className={styles.upiCard}>
          <div className={styles.qrCol}>
            <img
              src="/gpay-qr.png"
              alt="Payment QR code"
              className={styles.qrImg}
              width={200}
              height={200}
              onError={e => {
                const img = e.currentTarget
                const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`
                if (img.src !== fallback) img.src = fallback
              }}
            />
            <p className={styles.qrHint}>Scan with any UPI app</p>
          </div>
          <div className={styles.upiCol}>
            <div className={styles.upiField}>
              <span className={styles.upiFieldLabel}>UPI ID</span>
              <div className={styles.upiFieldRow}>
                <code className={styles.upiId}>{UPI_ID || 'drhibakazi@okaxis'}</code>
                <button className={styles.copyBtn} onClick={copyUpi}>{copied ? '✔ Copied' : 'Copy'}</button>
              </div>
            </div>
            <div className={styles.upiField}>
              <span className={styles.upiFieldLabel}>Amount</span>
              <span className={styles.upiAmount}>₹{AMOUNT} <span className={styles.upiAmountSub}>/ year</span></span>
            </div>
            <a className={styles.upiAppLink} href={upiLink}>Open in UPI app →</a>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Screenshot upload */}
        <div className={styles.screenshotSection}>
          <p className={styles.screenshotLabel}>
            Step 2 — Upload your payment screenshot
          </p>
          <label className={styles.screenshotDrop} onClick={() => fileRef.current?.click()}>
            {screenshotUrl
              ? <img src={screenshotUrl} className={styles.screenshotPreview} alt="Payment screenshot" />
              : (
                <div className={styles.screenshotPlaceholder}>
                  <span className={styles.screenshotIcon}>📎</span>
                  <span>Tap to select screenshot</span>
                  <span className={styles.screenshotHint}>JPG, PNG or any image from your gallery</span>
                </div>
              )
            }
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.fileInputHidden}
            onChange={handleScreenshot}
          />
          {screenshot && (
            <p className={styles.screenshotReady}>
              ✔ Screenshot selected — it will be attached in WhatsApp
            </p>
          )}
        </div>

        <button
          className={styles.whatsappBtn}
          onClick={() => openWhatsApp(false)}
          disabled={!screenshot}
          title={!screenshot ? 'Upload payment screenshot first' : ''}
        >
          ✓ &nbsp; {forRenewal ? "I've renewed" : "I've paid"} — send proof via WhatsApp
        </button>
        {!screenshot && (
          <p className={styles.whatsappNote}>Upload your payment screenshot above to continue.</p>
        )}
        {screenshot && (
          <p className={styles.whatsappNote}>
            WhatsApp will open — attach the screenshot and hit send. We'll activate you within a few hours.
          </p>
        )}
      </>
    )
  }

  return (
    <div className={styles.page}>

      {/* ── Nav ──────────────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>✚</span>
            <span className={styles.logoText}>DoctorFormAssist</span>
          </div>
          <a className={styles.navLink} href="#access">Get Access</a>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Zero signup · Works instantly · ₹1 / day</div>
        <h1 className={styles.heroTitle}>
          Lab Requisition PDFs<br />
          <span className={styles.heroAccent}>in seconds</span>
        </h1>
        <p className={styles.heroSub}>
          Set session details once, bulk-add patients, download all pages as one PDF.
          Everything runs in your browser — patient data never leaves your device.
        </p>
        <div className={styles.heroCtas}>
          <a className={styles.ctaPrimary} href="#access">Get Access — ₹{AMOUNT}/year →</a>
          <a className={styles.ctaGhost}   href="#features">See features</a>
        </div>
        <div className={styles.heroBullets}>
          <span>✔ No patient data ever uploaded</span>
          <span>✔ Works offline after first load</span>
          <span>✔ Instant PDF download</span>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className={styles.features} id="features">
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Everything you need, nothing you don't</h2>
          <div className={styles.featureGrid}>
            {[
              { icon: '🔒', title: '100% Private',      body: 'PDF generation happens entirely in your browser. Patient names, tests, and ward numbers never touch a server.' },
              { icon: '⚡', title: 'Bulk Entry',         body: 'Add a full ward in minutes. Set the session once, then zip through each patient with auto-test-selection.' },
              { icon: '📄', title: 'One PDF, All Pages', body: 'Every patient gets their own page. Download them all as a single, print-ready PDF with one click.' },
              { icon: '🏥', title: 'Ward & OPD',         body: 'Toggle between inpatient ward numbers and OPD. The form label switches automatically on the PDF.' },
            ].map(f => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className={styles.howSection}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>How to get access</h2>
          <div className={styles.steps}>
            {[
              { n: '1', title: 'Pay ₹365 via UPI',   body: 'Scan the QR code or copy the UPI ID below. Pay ₹365 from any UPI app — PhonePe, GPay, Paytm, etc.' },
              { n: '2', title: "Tap 'I've paid'",     body: "WhatsApp opens with your email and device ID pre-filled. Just hit send." },
              { n: '3', title: 'You\'re in',          body: 'We approve your device within a few hours. Come back, enter your email, and you\'re in — no key needed.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.n}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Access gate ──────────────────────────────── */}
      <section className={styles.accessSection} id="access">
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Get Access</h2>

          {/* Email input — always visible */}
          <div className={styles.emailGate}>
            <label className={styles.gateLabel} htmlFor="gate-email">
              {state === 'idle' || state === 'error'
                ? 'Enter your email to check or register:'
                : `Checking access for:`}
            </label>
            <div className={styles.gateRow}>
              <input
                id="gate-email"
                ref={emailRef}
                type="email"
                className={styles.gateInput}
                placeholder="doctor@hospital.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setState('idle'); setErrMsg('') }}
                onKeyDown={e => e.key === 'Enter' && checkAccess()}
                disabled={state === 'checking'}
              />
              <button
                className={styles.ctaPrimarySmall}
                onClick={checkAccess}
                disabled={state === 'checking' || !email.trim()}
              >
                {state === 'checking' ? '…' : 'Check →'}
              </button>
            </div>
            {errMsg && <p className={styles.errMsg}>{errMsg}</p>}
          </div>

          {/* ── Result panels ──────────────────────────── */}

          {/* New user — show payment */}
          {state === 'not_found' && (
            <div className={styles.resultPanel} ref={payRef}>
              <p className={styles.resultTitle}>
                <span className={styles.emailChip}>{email.trim()}</span> isn't registered yet.
              </p>
              <p className={styles.resultSub}>
                Step 1 — Pay ₹{AMOUNT}/year via UPI, then upload your screenshot and send us a WhatsApp.
              </p>
              <UpiPaymentPanel />
            </div>
          )}

          {/* Known email, new device */}
          {state === 'new_device' && (
            <div className={styles.resultPanel} ref={payRef}>
              <p className={styles.resultTitle}>
                <span className={styles.emailChip}>{email.trim()}</span> is registered — but not on this device.
              </p>
              <p className={styles.resultSub}>
                Send us a WhatsApp to add this browser. We'll approve it within a few hours.
              </p>
              <button className={styles.whatsappBtn} onClick={() => openWhatsApp(true)}>
                ✓ &nbsp; Request device access via WhatsApp
              </button>
              <p className={styles.whatsappNote}>
                Each WhatsApp message includes your device ID automatically — no manual copying needed.
              </p>
            </div>
          )}

          {/* Expired */}
          {state === 'expired' && (
            <div className={styles.resultPanel} ref={payRef}>
              <p className={styles.resultTitle}>
                Subscription expired for <span className={styles.emailChip}>{email.trim()}</span>.
              </p>
              <p className={styles.resultSub}>
                Pay ₹{AMOUNT} to renew, upload the screenshot, and send us a WhatsApp — we'll extend your access.
              </p>
              <UpiPaymentPanel forRenewal />
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className={styles.footer}>
        <p>DoctorFormAssist &copy; {new Date().getFullYear()}</p>
        <p className={styles.footerSub}>PDF generation runs 100% in your browser · No patient data ever uploaded</p>
      </footer>
    </div>
  )
}
