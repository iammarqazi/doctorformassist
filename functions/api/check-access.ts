// GET /api/check-access?email=xxx&device=DFA-XXXXXXXXXX
// Returns one of:
//   { status: 'approved',    expires_at: number }
//   { status: 'new_device'  }  — email known but this device not registered
//   { status: 'not_found'   }  — email not registered at all
//   { status: 'expired'     }  — subscription lapsed

interface Env { DB: D1Database }
interface Row { expires_at: number; plan: string }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const p        = new URL(ctx.request.url).searchParams
  const email    = p.get('email')?.toLowerCase().trim()
  const deviceId = p.get('device')?.trim()

  if (!email || !deviceId) {
    return Response.json({ status: 'error', error: 'email and device required' }, { status: 400 })
  }

  const row = await ctx.env.DB
    .prepare('SELECT expires_at, plan FROM approved_devices WHERE email = ? AND device_id = ?')
    .bind(email, deviceId)
    .first<Row>()

  if (row) {
    const now = Math.floor(Date.now() / 1000)
    return row.expires_at > now
      ? Response.json({ status: 'approved', expires_at: row.expires_at, plan: row.plan })
      : Response.json({ status: 'expired' })
  }

  // Email exists on a different device?
  const emailRow = await ctx.env.DB
    .prepare('SELECT 1 FROM approved_devices WHERE email = ? LIMIT 1')
    .bind(email)
    .first()

  return Response.json({ status: emailRow ? 'new_device' : 'not_found' })
}
