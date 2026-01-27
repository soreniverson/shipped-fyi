import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { ClustersClient } from './ClustersClient'

export default async function ClustersPage() {
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
        <h1 className="text-2xl font-semibold text-sand-900 mb-8">Feedback Clusters</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sand-600 mb-4">
              Create a project first to start collecting feedback.
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
          <h1 className="text-2xl font-semibold text-sand-900">Feedback Clusters</h1>
          <p className="text-sand-600 mt-1">
            Similar feedback grouped together by AI
          </p>
        </div>
      </div>

      <ClustersClient projects={projects} />
    </div>
  )
}
