interface Env {
  DB: D1Database
}

interface LicenseRow {
  email:      string
  plan:       string
  expires_at: number
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const key = new URL(ctx.request.url).searchParams.get('key')

  if (!key) {
    return Response.json({ valid: false, error: 'No key provided' }, { status: 400 })
  }

  const row = await ctx.env.DB
    .prepare('SELECT email, plan, expires_at FROM licenses WHERE license_key = ?')
    .bind(key.trim().toUpperCase())
    .first<LicenseRow>()

  if (!row) {
    return Response.json({ valid: false })
  }

  const valid = row.expires_at > Math.floor(Date.now() / 1000)
  return Response.json({ valid, email: row.email, plan: row.plan, expires_at: row.expires_at })
}
