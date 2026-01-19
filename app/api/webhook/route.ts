import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook operations - lazily initialized
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase configuration for webhooks')
  }
  return createClient(url, key)
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const subscriptionId = (session as unknown as { subscription: string }).subscription
        const customerId = (session as unknown as { customer: string }).customer

        // Get the subscription details
        const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = (subscriptionData as unknown as { metadata: { supabase_user_id: string } }).metadata.supabase_user_id
        const periodEnd = (subscriptionData as unknown as { current_period_end: number }).current_period_end

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: 'pro',
          status: 'active',
          current_period_end: new Date(periodEnd * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const subData = subscription as unknown as {
          id: string
          metadata: { supabase_user_id: string }
          status: string
          current_period_end: number
        }

        await supabaseAdmin.from('subscriptions').update({
          status: subData.status === 'active' ? 'active' :
                  subData.status === 'past_due' ? 'past_due' :
                  subData.status === 'canceled' ? 'canceled' : 'active',
          current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subData.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as { id: string }

        await supabaseAdmin.from('subscriptions').update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as { subscription: string | null }
        const subscriptionId = invoice.subscription

        if (subscriptionId) {
          await supabaseAdmin.from('subscriptions').update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subscriptionId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
