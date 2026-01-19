import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-sand-900">Your Projects</h1>
          <p className="text-sand-600 mt-1">Manage your feedback boards</p>
        </div>
        <Link href="/dashboard/new">
          <Button>Create project</Button>
        </Link>
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
