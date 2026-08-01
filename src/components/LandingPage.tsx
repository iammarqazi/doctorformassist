import { useState, useRef, useEffect } from 'react'
import { getOrCreateDeviceId } from '@/hooks/useAccess'
import styles from './LandingPage.module.css'

const UPI_ID = import.meta.env.VITE_UPI_ID   || 'mediteasy2020@okaxis'
const WA_NUM = import.meta.env.VITE_WHATSAPP || '919326281685'
const AMOUNT = 365

// Temporary demo video — replace with the real "how to use" video ID
const DEMO_VIDEO_ID = 'wJ7WKoObqWY'

const upiLink = `upi://pay?pa=${UPI_ID}&pn=DoctorFormAssist&am=${AMOUNT}&cu=INR&tn=DoctorFormAssist+Annual`

const AFFILIATE_PRODUCTS = [
  {
    id: 'printer-green',
    title: 'SEZNIK Mini Portable Printer — Green',
    desc: 'Inkless thermal Bluetooth printer — print straight from your phone, no ink needed.',
    price: 2089,
    image: 'https://m.media-amazon.com/images/I/41o+f5khYKL.jpg',
    url: 'https://www.amazon.in/dp/B0DG98Q4HD/ref=cm_sw_r_as_gl_apa_gl_i_dl_C2FMG94WSC9XWQJW2EVM?linkCode=ml1&tag=qazi0c-21&linkId=e069da614488649da656c87a935ae4ca',
  },
  {
    id: 'printer-blue',
    title: 'SEZNIK Mini Wireless Printer — Blue',
    desc: 'Compact wireless inkjet printer that pairs with Android & iOS — carry it between wards.',
    price: 2068,
    image: 'https://m.media-amazon.com/images/I/4177qY8tHnL.jpg',
    url: 'https://link.amazon/B0aUo03ah',
  },
  {
    id: 'printer-pink',
    title: 'SEZNIK Mini Portable Printer — Pink',
    desc: 'Inkless thermal Bluetooth printer — print straight from your phone, no ink needed.',
    price: 2089,
    image: 'https://m.media-amazon.com/images/I/41gLglOqWQL.jpg',
    url: 'https://www.amazon.in/dp/B0DG96SJFG/ref=cm_sw_r_as_gl_apa_gl_i_3EZ1JZNQD8HN8QH32748?linkCode=ml1&tag=qazi0c-21&linkId=0cf82c287475ffcc294d92757e9ec7f2',
  },
  {
    id: 'labels',
    title: 'SEZNIK Thermal Labels, 500-pack',
    desc: 'Waterproof, tear-resistant 2-inch thermal labels for your label printer.',
    price: 303,
    image: 'https://m.media-amazon.com/images/I/41Zoc2pQ8rL.jpg',
    url: 'https://link.amazon/B0hOyGwjW',
  },
] as const

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
  const [email,  setEmail]  = useState('')
  const [state,  setState]  = useState<CheckState>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [utr,    setUtr]    = useState('')
  const deviceId = useRef(getOrCreateDeviceId())
  const payRef   = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const utrRef   = useRef<HTMLInputElement>(null)

  useEffect(() => { emailRef.current?.focus() }, [])

  async function checkAccess() {
    const e = email.trim().toLowerCase()
    if (!e || !e.includes('@')) { setErrMsg('Enter a valid email address.'); return }
    setErrMsg('')
    setUtr('')
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
      if (data.status === 'not_found' || data.status === 'new_device' || data.status === 'expired') {
        setTimeout(() => {
          payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          if (data.status !== 'new_device') setTimeout(() => utrRef.current?.focus(), 400)
        }, 50)
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
      : `Hi, I've paid ₹${AMOUNT} for DoctorFormAssist. Please activate my account.\nEmail: ${e}\nDevice ID: ${deviceId.current}\nUTR: ${utr.trim()}`
    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const utrValid = utr.trim().length >= 12

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
                <code className={styles.upiId}>{UPI_ID}</code>
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

        {/* UTR input */}
        <div className={styles.utrSection}>
          <label className={styles.utrLabel} htmlFor="utr-input">
            Step 2 — Enter your UTR / Transaction ID
          </label>
          <input
            id="utr-input"
            ref={utrRef}
            type="text"
            inputMode="numeric"
            className={styles.utrInput}
            placeholder="e.g. 506241826543"
            value={utr}
            onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
            maxLength={12}
          />
          <p className={styles.utrHint}>
            Open your UPI app → last transaction → payment receipt — copy the 12-digit UTR/reference number.
          </p>
        </div>

        <button
          className={styles.whatsappBtn}
          onClick={() => openWhatsApp(false)}
          disabled={!utrValid}
          title={!utrValid ? 'Enter your 12-digit UTR first' : ''}
        >
          ✓ &nbsp; {forRenewal ? "I've renewed" : "I've paid"} — notify via WhatsApp
        </button>
        {!utrValid && (
          <p className={styles.whatsappNote}>Enter your UTR above to continue.</p>
        )}
        {utrValid && (
          <p className={styles.whatsappNote}>
            WhatsApp will open with your UTR pre-filled. Just hit send — we'll verify and activate within a few hours.
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
            <span className={styles.navDivider} />
            <div className={styles.poweredBy}>
              <span className={styles.poweredByLabel}>An initiative by</span>
              <img src="/mediteasy-logo.png" alt="MED it Easy" className={styles.poweredByLogo} />
            </div>
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

      {/* ── Demo video ───────────────────────────────── */}
      <section className={styles.videoSection} id="demo">
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>See how it works</h2>
          <div className={styles.videoWrap}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_ID}?rel=0&modestbranding=1`}
              title="How to use DoctorFormAssist"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className={styles.features} id="features">
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Everything you need, nothing you don't</h2>
          <div className={styles.featureGrid}>
            {[
              { icon: '🔒', title: '100% Patient Data Privacy', body: 'PDF generation happens entirely in your browser. Patient names, tests, and ward numbers never touch a server.' },
              { icon: '⚡', title: 'Bulk Entry',                 body: 'Add a full ward in minutes with auto-test-selection. Tap "T" next to tomorrow\'s test to prep it in advance.' },
              { icon: '🏷️', title: 'Lab-Tested Labels',          body: 'Personally tested and accepted by labs without any issues.' },
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
              { n: '1', title: 'Pay ₹365 via UPI',      body: 'Scan the QR code or copy the UPI ID below. Pay ₹365 from any UPI app — PhonePe, GPay, Paytm, etc.' },
              { n: '2', title: 'Enter your UTR',         body: 'After paying, open the payment receipt in your UPI app and copy the 12-digit UTR/transaction reference.' },
              { n: '3', title: "Send a WhatsApp",        body: 'Hit the button — WhatsApp opens with your details pre-filled. We verify the UTR and activate you within hours.' },
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
                : 'Checking access for:'}
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
                Step 1 — Pay ₹{AMOUNT}/year via UPI, then enter your UTR and send us a WhatsApp.
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
                Your device ID is included automatically — no manual copying needed.
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
                Pay ₹{AMOUNT} to renew, enter your UTR, and send us a WhatsApp — we'll extend your access.
              </p>
              <UpiPaymentPanel forRenewal />
            </div>
          )}
        </div>
      </section>

      {/* ── Recommended gear ─────────────────────────── */}
      <section className={styles.affiliateSection} id="gear">
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>Recommended printer &amp; labels</h2>
          <p className={styles.affiliateIntro}>
            Need hardware to print your requisition PDFs? Here's what works well.
          </p>
          <div className={styles.affiliateGrid}>
            {AFFILIATE_PRODUCTS.map(p => (
              <a
                key={p.id}
                className={styles.affiliateCard}
                href={p.url}
                target="_blank"
                rel="nofollow sponsored noopener"
              >
                <img src={p.image} alt={p.title} className={styles.affiliateImg} loading="lazy" />
                <div className={styles.affiliateBody}>
                  <h3 className={styles.affiliateTitle}>{p.title}</h3>
                  <p className={styles.affiliateDesc}>{p.desc}</p>
                  <span className={styles.affiliatePrice}>₹{p.price}</span>
                  <span className={styles.affiliateCta}>View on Amazon →</span>
                </div>
              </a>
            ))}
          </div>
          <p className={styles.affiliateDisclosure}>
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
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
