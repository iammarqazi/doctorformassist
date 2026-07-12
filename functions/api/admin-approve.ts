// POST /api/admin-approve
// Header: X-Admin-Secret: <ADMIN_SECRET>
// Body:   { "email": "user@hospital.com", "device_id": "DFA-XXXXXXXXXX", "plan": "yearly" }
//
// Call this after receiving a WhatsApp from a user who has paid.
// It approves that specific (email, device) pair.
//
// Example:
//   curl -X POST https://doctorformassist.com/api/admin-approve \
//        -H "Content-Type: application/json" \
//        -H "X-Admin-Secret: your-secret" \
//        -d '{"email":"doctor@hospital.com","device_id":"DFA-A1B2C3D4E5F6"}'

interface Env {
  DB: D1Database
  ADMIN_SECRET: string
}

const PLAN_DAYS: Record<string, number> = {
  monthly:  30,
  yearly:   365,
  lifetime: 36500,
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  if (ctx.request.headers.get('X-Admin-Secret') !== ctx.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, device_id, plan = 'yearly' } = await ctx.request.json() as {
      email?: string; device_id?: string; plan?: string
    }

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 })
    }
    if (!device_id) {
      return Response.json({ error: 'device_id required' }, { status: 400 })
    }

    const expiresAt = Math.floor(Date.now() / 1000) + (PLAN_DAYS[plan] ?? 365) * 86400

    await ctx.env.DB.prepare(`
      INSERT INTO approved_devices (email, device_id, plan, expires_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email, device_id) DO UPDATE SET
        plan = excluded.plan, expires_at = excluded.expires_at
    `).bind(email.toLowerCase(), device_id, plan, expiresAt).run()

    return Response.json({ success: true, email, device_id, expires_at: expiresAt })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
