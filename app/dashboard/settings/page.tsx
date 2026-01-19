import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserSubscription } from '@/lib/subscription'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { BillingSection } from '@/components/BillingSection'
import { PLANS } from '@/lib/stripe'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscription = await getUserSubscription(user.id)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-sand-900 mb-8">Settings</h1>

      {/* Account */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-medium text-sand-900">Account</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-sand-500">Email</label>
              <p className="text-sand-900">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-medium text-sand-900">Subscription</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sand-900">
                  {subscription.plan === 'pro' ? 'Pro' : 'Free'} plan
                </span>
                {subscription.plan === 'pro' && (
                  <span className="text-xs bg-lime-100 text-lime-800 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-sand-500 mt-1">
                {subscription.plan === 'pro'
                  ? 'Unlimited projects and items'
                  : `${subscription.limits.projects} project, ${subscription.limits.items} items`}
              </p>
            </div>
          </div>

          {/* Usage */}
          <div className="bg-sand-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-sand-700 mb-3">Usage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-sand-600">Projects</span>
                  <span className="text-sand-900">
                    {subscription.usage.projects}
                    {subscription.plan === 'free' && ` / ${subscription.limits.projects}`}
                  </span>
                </div>
                {subscription.plan === 'free' && (
                  <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sand-600 rounded-full"
                      style={{ width: `${Math.min(100, (subscription.usage.projects / subscription.limits.projects) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-sand-600">Items</span>
                  <span className="text-sand-900">
                    {subscription.usage.items}
                    {subscription.plan === 'free' && ` / ${subscription.limits.items}`}
                  </span>
                </div>
                {subscription.plan === 'free' && (
                  <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sand-600 rounded-full"
                      style={{ width: `${Math.min(100, (subscription.usage.items / subscription.limits.items) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <BillingSection plan={subscription.plan} />
        </CardContent>
      </Card>

      {/* Plan comparison for free users */}
      {subscription.plan === 'free' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-sand-900">Upgrade to Pro</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-semibold text-sand-900">${PLANS.pro.price}</span>
              <span className="text-sand-500">/month</span>
            </div>
            <ul className="space-y-2 mb-4">
              {PLANS.pro.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-sand-700">
                  <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <BillingSection plan="free" showUpgrade />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
