import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { InboxClient } from './InboxClient'

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's projects for the dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug')
    .eq('owner_id', user!.id)
    .order('name')

  if (!projects || projects.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-sand-900 mb-8">Feedback Inbox</h1>
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
          <h1 className="text-2xl font-semibold text-sand-900">Feedback Inbox</h1>
          <p className="text-sand-600 mt-1">
            Review and approve AI-extracted feedback
          </p>
        </div>
      </div>

      <InboxClient projects={projects} />
    </div>
  )
}
