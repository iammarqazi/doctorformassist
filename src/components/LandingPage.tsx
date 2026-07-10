import { useState, useRef } from 'react'
import styles from './LandingPage.module.css'

const UPI_ID   = import.meta.env.VITE_UPI_ID    || 'your-upi-id@upi'
const UPI_NAME = import.meta.env.VITE_UPI_NAME  || 'DoctorFormAssist'
const WA_NUM   = import.meta.env.VITE_WHATSAPP  || '919999999999'
const AMOUNT   = 365

const upiLink  = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${AMOUNT}&cu=INR&tn=DoctorFormAssist+Annual`
const qrSrc    = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=4fc3f7&bgcolor=161b24&data=${encodeURIComponent(upiLink)}`

interface LandingPageProps {
  onActivated: () => void
}

export function LandingPage({ onActivated }: LandingPageProps) {
  const [email, setEmail]           = useState('')
  const [copied, setCopied]         = useState(false)
  const [showLogin, setShowLogin]   = useState(false)
  const [loginKey, setLoginKey]     = useState('')
  const [loginErr, setLoginErr]     = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const payRef = useRef<HTMLElement>(null)

  const scrollToPay = () => payRef.current?.scrollIntoView({ behavior: 'smooth' })

  function copyUpi() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function openWhatsApp() {
    const msg = email.trim()
      ? `Hi, I've paid ₹${AMOUNT} for DoctorFormAssist. My email: ${email.trim()}`
      : `Hi, I've paid ₹${AMOUNT} for DoctorFormAssist. My email: `
    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  async function handleLogin() {
    const key = loginKey.trim().toUpperCase()
    if (!key) return
    setLoginLoading(true)
    setLoginErr('')
    try {
      const res  = await fetch(`/api/check-license?key=${encodeURIComponent(key)}`)
      const data = await res.json() as { valid: boolean; expires_at?: number }
      if (data.valid) {
        localStorage.setItem('dfa_license_key',    key)
        localStorage.setItem('dfa_license_expiry', String(data.expires_at ?? 0))
        onActivated()
      } else {
        setLoginErr('Invalid or expired key. Check the WhatsApp message we sent you.')
      }
    } catch {
      setLoginErr('Could not verify key — check your internet connection.')
    } finally {
      setLoginLoading(false)
    }
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
          <button className={styles.navLink} onClick={() => setShowLogin(v => !v)}>
            I have a license key
          </button>
        </div>

        {showLogin && (
          <div className={styles.loginBar}>
            <div className={styles.loginBarInner}>
              <input
                className={styles.keyInput}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                value={loginKey}
                onChange={e => setLoginKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                spellCheck={false}
                aria-label="License key"
              />
              <button
                className={styles.ctaSmall}
                onClick={handleLogin}
                disabled={loginLoading || !loginKey.trim()}
              >
                {loginLoading ? '…' : 'Activate →'}
              </button>
            </div>
            {loginErr && <p className={styles.loginErr}>{loginErr}</p>}
          </div>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Zero signup · Pay once · Works instantly</div>
        <h1 className={styles.heroTitle}>
          Lab Requisition PDFs<br />
          <span className={styles.heroAccent}>in seconds — ₹1 / day</span>
        </h1>
        <p className={styles.heroSub}>
          Set session details once, bulk-add patients, download all pages as one PDF.
          Everything runs in your browser — patient data never leaves your device.
        </p>
        <div className={styles.heroCtas}>
          <button className={styles.ctaPrimary} onClick={scrollToPay}>
            Pay ₹{AMOUNT} via UPI →
          </button>
          <a className={styles.ctaGhost} href="#features">See features</a>
        </div>
        <div className={styles.heroBullets}>
          <span>✔ No patient data ever uploaded</span>
          <span>✔ Works offline after first load</span>
          <span>✔ Instant PDF download</span>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Everything you need, nothing you don't</h2>
          <div className={styles.featureGrid}>
            {[
              { icon: '🔒', title: '100% Private',     body: 'PDF generation happens entirely in your browser. Patient names, tests, and ward numbers never touch a server.' },
              { icon: '⚡', title: 'Bulk Patient Entry', body: 'Add a full ward in minutes. Set the session once, then zip through each patient with auto-test-selection.' },
              { icon: '📄', title: 'One PDF, All Pages', body: 'Every patient gets their own page. Download them all as a single, print-ready PDF with one click.' },
              { icon: '🏥', title: 'Ward & OPD Support', body: 'Toggle between inpatient ward numbers and OPD. The form label switches automatically on the PDF.' },
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
      <section className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How to get access</h2>
          <div className={styles.steps}>
            {[
              { n: '1', title: 'Pay ₹365 via UPI',    body: 'Scan the QR code or copy the UPI ID below. Pay exactly ₹365 from any UPI app.' },
              { n: '2', title: "Click 'I've paid'",   body: "WhatsApp opens with a pre-filled message. Just add your email and send it." },
              { n: '3', title: 'Receive your key',    body: "We'll reply with your license key on WhatsApp, usually within a few hours." },
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

      {/* ── Pay via UPI ──────────────────────────────── */}
      <section className={styles.paySection} ref={payRef} id="pay">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Pay ₹{AMOUNT} / year via UPI</h2>
          <p className={styles.paySub}>≈ ₹1 per day · 1 year access · Any UPI app accepted</p>

          <div className={styles.upiCard}>
            {/* QR */}
            <div className={styles.qrWrap}>
              <img
                src={qrSrc}
                alt="UPI QR code"
                className={styles.qrImg}
                width={220}
                height={220}
              />
              <p className={styles.qrHint}>Scan with any UPI app</p>
            </div>

            {/* Details */}
            <div className={styles.upiDetails}>
              <div className={styles.upiRow}>
                <span className={styles.upiLabel}>UPI ID</span>
                <div className={styles.upiValueRow}>
                  <code className={styles.upiId}>{UPI_ID}</code>
                  <button className={styles.copyBtn} onClick={copyUpi}>
                    {copied ? '✔ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className={styles.upiRow}>
                <span className={styles.upiLabel}>Amount</span>
                <span className={styles.upiValue}>₹{AMOUNT}</span>
              </div>

              {/* Mobile UPI deeplink */}
              <a className={styles.upiAppBtn} href={upiLink}>
                Open in UPI app
              </a>

              <div className={styles.divider} />

              <p className={styles.whatsappLabel}>Enter your email, then send us a WhatsApp</p>
              <input
                type="email"
                className={styles.emailInput}
                placeholder="doctor@hospital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && openWhatsApp()}
              />
              <button className={styles.whatsappBtn} onClick={openWhatsApp}>
                <span className={styles.waBubble}>✓</span>
                I've paid — notify via WhatsApp →
              </button>
              <p className={styles.whatsappNote}>
                We'll reply with your license key, usually within a few hours.
              </p>
            </div>
          </div>

          {/* License key entry */}
          <div className={styles.keySection}>
            <p className={styles.keyPrompt}>Already have your license key?</p>
            <div className={styles.keyRow}>
              <input
                className={styles.keyInput}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                value={loginKey}
                onChange={e => setLoginKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                spellCheck={false}
                aria-label="License key"
              />
              <button
                className={styles.ctaSmall}
                onClick={handleLogin}
                disabled={loginLoading || !loginKey.trim()}
              >
                {loginLoading ? '…' : 'Activate →'}
              </button>
            </div>
            {loginErr && <p className={styles.loginErr}>{loginErr}</p>}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className={styles.footer}>
        <p>DoctorFormAssist &copy; {new Date().getFullYear()}</p>
        <p className={styles.footerSub}>
          PDF generation runs 100% in your browser · No patient data ever uploaded
        </p>
      </footer>
    </div>
  )
}
