interface Env {
  RAZORPAY_KEY_ID: string
  RAZORPAY_KEY_SECRET: string
}

const PLANS: Record<string, { amount: number; days: number; label: string }> = {
  monthly:  { amount:  3000, days:    30, label: '1 Month Access — DoctorFormAssist' },
  yearly:   { amount: 29900, days:   365, label: '1 Year Access — DoctorFormAssist'  },
  lifetime: { amount: 99900, days: 36500, label: 'Lifetime Access — DoctorFormAssist' },
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const body = await ctx.request.json() as { email?: string; plan?: string }
    const { email, plan = 'monthly' } = body

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Valid email required' }, { status: 400 })
    }

    const planConfig = PLANS[plan]
    if (!planConfig) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const credentials = btoa(`${ctx.env.RAZORPAY_KEY_ID}:${ctx.env.RAZORPAY_KEY_SECRET}`)

    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: planConfig.amount,
        currency: 'INR',
        receipt: `dfa_${Date.now()}`,
        notes: { email, plan },
      }),
    })

    if (!resp.ok) {
      console.error('Razorpay create-order error:', await resp.text())
      return Response.json({ error: 'Payment service error' }, { status: 502 })
    }

    const order = await resp.json() as { id: string; amount: number; currency: string }

    return Response.json({
      order_id:   order.id,
      amount:     order.amount,
      currency:   order.currency,
      plan_label: planConfig.label,
    })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
