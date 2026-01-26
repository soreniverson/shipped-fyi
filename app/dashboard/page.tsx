import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { getUserSubscription } from '@/lib/subscription'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  const subscription = await getUserSubscription(user!.id)
  const showUpgradeBanner = subscription.plan === 'free' && (
    subscription.usage.projects >= subscription.limits.projects * 0.8 ||
    subscription.usage.items >= subscription.limits.items * 0.8
  )

  return (
    <div>
      {showUpgradeBanner && (
        <div className="bg-sand-100 border border-sand-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-sand-900">
              {subscription.usage.projects >= subscription.limits.projects
                ? "You've reached your project limit"
                : `Using ${subscription.usage.items} of ${subscription.limits.items} items`}
            </p>
            <p className="text-xs text-sand-600 mt-0.5">
              Upgrade to Pro for unlimited projects and items
            </p>
          </div>
          <Link href="/pricing">
            <Button size="sm">Upgrade</Button>
          </Link>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-sand-900">Your Projects</h1>
          <p className="text-sand-600 mt-1">
            {subscription.plan === 'pro'
              ? 'Pro plan - unlimited boards'
              : `${subscription.usage.projects}/${subscription.limits.projects} boards`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm">Settings</Button>
          </Link>
          {subscription.canCreateProject ? (
            <Link href="/dashboard/new">
              <Button>Create project</Button>
            </Link>
          ) : (
            <Link href="/pricing">
              <Button>Upgrade to create more</Button>
            </Link>
          )}
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/${project.slug}`}>
              <Card className="hover:border-sand-300 transition-colors cursor-pointer h-full">
                <CardContent className="py-6">
                  <h2 className="text-lg font-medium text-sand-900">{project.name}</h2>
                  <p className="text-sm text-sand-500 mt-1">/{project.slug}</p>
                  <p className="text-xs text-sand-400 mt-3">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sand-600 mb-4">You don&apos;t have any projects yet.</p>
            <Link href="/dashboard/new">
              <Button>Create your first project</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
