interface Env {
  DB: D1Database
  RAZORPAY_KEY_SECRET: string
}

interface PaymentBody {
  razorpay_order_id:   string
  razorpay_payment_id: string
  razorpay_signature:  string
  email: string
  plan?: string
}

interface LicenseRow { license_key: string; expires_at: number }

const PLAN_DAYS: Record<string, number> = {
  monthly:  30,
  yearly:   365,
  lifetime: 36500,
}

async function verifySignature(orderId: string, paymentId: string, sig: string, secret: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(`${orderId}|${paymentId}`))
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hex === sig
}

function newKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-')
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const body = await ctx.request.json() as PaymentBody
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, plan = 'monthly' } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
      return Response.json({ error: 'Missing payment fields' }, { status: 400 })
    }

    const valid = await verifySignature(
      razorpay_order_id, razorpay_payment_id, razorpay_signature, ctx.env.RAZORPAY_KEY_SECRET
    )
    if (!valid) {
      return Response.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const days = PLAN_DAYS[plan] ?? 30
    const expiresAt = Math.floor(Date.now() / 1000) + days * 86400
    const licenseKey = newKey()

    try {
      await ctx.env.DB.prepare(
        `INSERT INTO licenses (license_key, email, payment_id, order_id, plan, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(licenseKey, email.toLowerCase(), razorpay_payment_id, razorpay_order_id, plan, expiresAt).run()

      return Response.json({ license_key: licenseKey, expires_at: expiresAt, email })
    } catch {
      // Duplicate payment_id — return the existing license
      const existing = await ctx.env.DB
        .prepare('SELECT license_key, expires_at FROM licenses WHERE payment_id = ?')
        .bind(razorpay_payment_id)
        .first<LicenseRow>()

      if (existing) {
        return Response.json({ license_key: existing.license_key, expires_at: existing.expires_at })
      }
      throw new Error('DB insert failed with no existing record')
    }
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
