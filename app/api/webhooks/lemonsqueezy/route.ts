import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const eventName: string = event.meta?.event_name ?? ''

  switch (eventName) {
    case 'order_created':
    case 'subscription_created': {
      const userId: string = event.meta?.custom_data?.user_id ?? ''
      // TODO: update user subscription status in Supabase
      console.log(`[LemonSqueezy] New subscription for user ${userId}`)
      break
    }

    case 'subscription_cancelled': {
      const userId: string = event.meta?.custom_data?.user_id ?? ''
      // TODO: downgrade user to free plan in Supabase
      console.log(`[LemonSqueezy] Subscription cancelled for user ${userId}`)
      break
    }

    default:
      console.log(`[LemonSqueezy] Unhandled event: ${eventName}`)
  }

  return NextResponse.json({ received: true })
}
