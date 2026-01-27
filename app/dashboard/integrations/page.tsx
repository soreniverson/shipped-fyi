import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { IntegrationsClient } from './IntegrationsClient'

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug')
    .eq('owner_id', user!.id)
    .order('name')

  if (!projects || projects.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-sand-900 mb-8">Integrations</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sand-600 mb-4">
              Create a project first to connect integrations.
            </p>
            <Link href="/dashboard/new">
              <Button>Create project</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-sand-900">Integrations</h1>
          <p className="text-sand-600 mt-1">
            Connect your feedback sources for automatic collection
          </p>
        </div>
      </div>

      <IntegrationsClient projects={projects} />
    </div>
  )
}
