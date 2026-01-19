import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/stripe'

export type Plan = 'free' | 'pro'

export interface UserSubscription {
  plan: Plan
  status: string
  limits: {
    projects: number
    items: number
  }
  usage: {
    projects: number
    items: number
  }
  canCreateProject: boolean
  canCreateItem: boolean
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const supabase = await createClient()

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single()

  const plan = (subscription?.plan || 'free') as Plan
  const status = subscription?.status || 'active'
  const limits = PLANS[plan].limits

  // Get usage counts
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)

  // Get total items across all user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', userId)

  let itemCount = 0
  if (projects && projects.length > 0) {
    const projectIds = projects.map(p => p.id)
    const { count } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
    itemCount = count || 0
  }

  return {
    plan,
    status,
    limits,
    usage: {
      projects: projectCount || 0,
      items: itemCount,
    },
    canCreateProject: (projectCount || 0) < limits.projects,
    canCreateItem: itemCount < limits.items,
  }
}

export async function checkProjectLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const subscription = await getUserSubscription(userId)

  if (!subscription.canCreateProject) {
    return {
      allowed: false,
      message: `You've reached the limit of ${subscription.limits.projects} project${subscription.limits.projects === 1 ? '' : 's'} on the ${subscription.plan} plan. Upgrade to Pro for unlimited projects.`
    }
  }

  return { allowed: true }
}

export async function checkItemLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const subscription = await getUserSubscription(userId)

  if (!subscription.canCreateItem) {
    return {
      allowed: false,
      message: `You've reached the limit of ${subscription.limits.items} items on the ${subscription.plan} plan. Upgrade to Pro for unlimited items.`
    }
  }

  return { allowed: true }
}
