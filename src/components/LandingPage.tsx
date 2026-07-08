import { useState, useRef } from 'react'
import styles from './LandingPage.module.css'

type Plan = 'monthly' | 'yearly' | 'lifetime'

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id:   string
  razorpay_signature:  string
}

interface OrderResponse {
  order_id:   string
  amount:     number
  currency:   string
  plan_label: string
  error?:     string
}

interface VerifyResponse {
  license_key: string
  expires_at:  number
  email?:      string
  error?:      string
}

const PLANS: Record<Plan, { price: string; period: string; badge: string; days: number; amount: number }> = {
  monthly:  { price: '₹30',  period: '/month',     badge: '≈ ₹1 / day',     days: 30,    amount: 3000  },
  yearly:   { price: '₹299', period: '/year',      badge: 'Best value',      days: 365,   amount: 29900 },
  lifetime: { price: '₹999', period: ' one-time',  badge: 'Pay once, forever', days: 36500, amount: 99900 },
}

interface LandingPageProps {
  onActivated: () => void
}

export function LandingPage({ onActivated }: LandingPageProps) {
  const [plan, setPlan]           = useState<Plan>('monthly')
  const [email, setEmail]         = useState('')
  const [step, setStep]           = useState<'idle' | 'paying' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg]   = useState('')
  const [newKey, setNewKey]       = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [loginKey, setLoginKey]   = useState('')
  const [loginErr, setLoginErr]   = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const pricingRef = useRef<HTMLElement>(null)

  const scrollToPricing = () => pricingRef.current?.scrollIntoView({ behavior: 'smooth' })

  async function handlePay() {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      setStep('error')
      return
    }
    setStep('paying')
    setErrorMsg('')

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), plan }),
      })
      const order: OrderResponse = await orderRes.json()
      if (!orderRes.ok || order.error) throw new Error(order.error ?? 'Could not create order')

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID
      const rzp = new window.Razorpay({
        key:         rzpKey,
        amount:      order.amount,
        currency:    order.currency,
        name:        'DoctorFormAssist',
        description: order.plan_label,
        order_id:    order.order_id,
        prefill:     { email: email.trim() },
        theme:       { color: '#4fc3f7' },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, email: email.trim(), plan }),
            })
            const data: VerifyResponse = await verifyRes.json()
            if (!verifyRes.ok || data.error) throw new Error(data.error ?? 'Verification failed')

            localStorage.setItem('dfa_license_key',    data.license_key)
            localStorage.setItem('dfa_license_expiry', String(data.expires_at))
            setNewKey(data.license_key)
            setStep('success')
          } catch (e) {
            setErrorMsg(e instanceof Error ? e.message : 'Payment verification failed.')
            setStep('error')
          }
        },
        modal: { ondismiss: () => setStep('idle') },
      })
      rzp.open()
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Payment failed. Please try again.')
      setStep('error')
    }
  }

  async function handleLogin() {
    const key = loginKey.trim().toUpperCase()
    if (!key) return
    setLoginLoading(true)
    setLoginErr('')
    try {
      const res  = await fetch(`/api/check-license?key=${encodeURIComponent(key)}`)
      const data = await res.json() as { valid: boolean; expires_at?: number; email?: string }
      if (data.valid) {
        localStorage.setItem('dfa_license_key',    key)
        localStorage.setItem('dfa_license_expiry', String(data.expires_at ?? 0))
        onActivated()
      } else {
        setLoginErr('Invalid or expired key. Check your email for the key sent after payment.')
      }
    } catch {
      setLoginErr('Could not verify key. Check your internet connection.')
    } finally {
      setLoginLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.successWrap}>
          <div className={styles.successIcon}>✚</div>
          <h1 className={styles.successTitle}>You're in!</h1>
          <p className={styles.successSub}>Save your license key — you'll need it to log in on a new device.</p>
          <div className={styles.keyBox}>{newKey}</div>
          <button className={styles.ctaPrimary} onClick={onActivated}>
            Open DoctorFormAssist →
          </button>
          <p className={styles.successNote}>This key was also stored in your browser automatically.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* ── Nav ─────────────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark} aria-hidden="true">✚</span>
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
                {loginLoading ? '...' : 'Activate →'}
              </button>
            </div>
            {loginErr && <p className={styles.loginErr}>{loginErr}</p>}
          </div>
        )}
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Trusted by hospital doctors across India</div>
        <h1 className={styles.heroTitle}>
          Lab Requisition PDFs<br />
          <span className={styles.heroAccent}>in seconds — for ₹1/day</span>
        </h1>
        <p className={styles.heroSub}>
          Set session details once, bulk-add patients, download all pages as one PDF.
          100% private — everything runs in your browser.
        </p>
        <div className={styles.heroCtas}>
          <button className={styles.ctaPrimary} onClick={scrollToPricing}>
            Get Access →
          </button>
          <a className={styles.ctaGhost} href="#features">See features</a>
        </div>
        <div className={styles.heroBullets}>
          <span>✔ No patient data ever leaves your device</span>
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
              {
                icon: '🔒',
                title: '100% Private',
                body: 'PDF generation happens entirely in your browser. Patient names, tests, and ward numbers never touch a server.',
              },
              {
                icon: '⚡',
                title: 'Bulk Patient Entry',
                body: 'Add a full ward in minutes. Set the session once, then zip through each patient with auto-test-selection.',
              },
              {
                icon: '📄',
                title: 'One PDF, All Pages',
                body: 'Every patient gets their own page. Download them all as a single, print-ready PDF with one click.',
              },
              {
                icon: '🏥',
                title: 'Ward & OPD Support',
                body: 'Toggle between inpatient ward numbers and OPD. The form label switches automatically on the PDF.',
              },
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
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.steps}>
            {[
              { n: '1', title: 'Set session details',  body: 'Enter the date, unit, and ward number once for the entire session.' },
              { n: '2', title: 'Add patients & tests', body: 'Type each patient\'s name, bed number, and select the required investigations.' },
              { n: '3', title: 'Download as PDF',      body: 'Hit Download — get a single PDF with one form per patient, ready to print.' },
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

      {/* ── Pricing ──────────────────────────────────── */}
      <section className={styles.pricing} ref={pricingRef} id="pricing">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Simple, honest pricing</h2>
          <p className={styles.pricingNote}>
            Pay via UPI, card, netbanking, or wallet — Razorpay handles all of it securely.
          </p>

          <div className={styles.planGrid}>
            {(Object.entries(PLANS) as [Plan, typeof PLANS[Plan]][]).map(([key, p]) => (
              <button
                key={key}
                className={`${styles.planCard} ${plan === key ? styles.planSelected : ''}`}
                onClick={() => setPlan(key)}
                type="button"
              >
                {key === 'yearly' && <div className={styles.planPopular}>Most popular</div>}
                <div className={styles.planBadge}>{p.badge}</div>
                <div className={styles.planPrice}>{p.price}</div>
                <div className={styles.planPeriod}>{p.period}</div>
                <div className={styles.planCheck}>{plan === key ? '◉' : '○'}</div>
              </button>
            ))}
          </div>

          {/* Payment form */}
          <div className={styles.payForm}>
            <label className={styles.payLabel} htmlFor="pay-email">Your email (for key delivery)</label>
            <input
              id="pay-email"
              type="email"
              className={styles.payInput}
              placeholder="doctor@hospital.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (step === 'error') setStep('idle') }}
              onKeyDown={e => e.key === 'Enter' && handlePay()}
            />

            <button
              className={styles.ctaPrimary}
              onClick={handlePay}
              disabled={step === 'paying'}
              style={{ width: '100%', marginTop: '0.75rem', fontSize: '1rem', padding: '0.85rem' }}
            >
              {step === 'paying'
                ? 'Opening payment...'
                : `Pay ${PLANS[plan].price} with UPI / Card →`}
            </button>

            {step === 'error' && (
              <p className={styles.payError}>{errorMsg}</p>
            )}

            <p className={styles.payMeta}>
              Secured by Razorpay &nbsp;·&nbsp; No data stored on our servers &nbsp;·&nbsp; Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className={styles.footer}>
        <p>DoctorFormAssist &copy; {new Date().getFullYear()}</p>
        <p className={styles.footerSub}>
          PDF generation runs 100% in your browser &nbsp;·&nbsp; No patient data ever uploaded
        </p>
      </footer>
    </div>
  )
}
