// POST /api/admin-add-license
// Header: X-Admin-Secret: <ADMIN_SECRET>
// Body:   { "email": "user@hospital.com", "plan": "yearly" }
// Usage (after user pays and WhatsApps you):
//   curl -X POST https://doctorformassist.com/api/admin-add-license \
//        -H "Content-Type: application/json" \
//        -H "X-Admin-Secret: your-secret" \
//        -d '{"email":"user@hospital.com"}'

interface Env {
  DB: D1Database
  ADMIN_SECRET: string
}

const PLAN_DAYS: Record<string, number> = {
  monthly:  30,
  yearly:   365,
  lifetime: 36500,
}

function newKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-')
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  if (ctx.request.headers.get('X-Admin-Secret') !== ctx.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, plan = 'yearly' } = await ctx.request.json() as { email?: string; plan?: string }

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 })
    }

    const days       = PLAN_DAYS[plan] ?? 365
    const expiresAt  = Math.floor(Date.now() / 1000) + days * 86400
    const licenseKey = newKey()
    const ref        = `manual_${Date.now()}`

    await ctx.env.DB.prepare(
      `INSERT INTO licenses (license_key, email, payment_id, order_id, plan, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(licenseKey, email.toLowerCase(), ref, ref, plan, expiresAt).run()

    return Response.json({ license_key: licenseKey, email, expires_at: expiresAt })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
