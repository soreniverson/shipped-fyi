import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Item } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ slug: string }>
}

const statusLabels: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
}

const statusColors: Record<string, string> = {
  planned: 'bg-violet-100 text-violet-700 border-violet-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) {
    notFound()
  }

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('project_id', project.id)
    .in('status', ['planned', 'in_progress'])
    .order('vote_count', { ascending: false })

  const plannedItems = items?.filter((item) => item.status === 'planned') || []
  const inProgressItems = items?.filter((item) => item.status === 'in_progress') || []

  const renderSection = (title: string, status: string, items: Item[]) => (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-sand-900 mb-4 flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${status === 'in_progress' ? 'bg-blue-500' : 'bg-violet-500'}`} />
        {title}
        <span className="text-sand-400 font-normal">({items.length})</span>
      </h2>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-sand-900">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-sand-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-sand-500 whitespace-nowrap">
                    {item.vote_count} votes
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sand-500 text-sm">No items yet</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-sand-50">
      <header className="bg-white border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-sand-900">{project.name}</h1>
          <p className="text-sand-600 mt-1">What we&apos;re working on</p>
          <nav className="flex gap-4 mt-4">
            <Link
              href={`/${project.slug}`}
              className="text-sm text-sand-600 hover:text-sand-900 pb-1"
            >
              Feedback
            </Link>
            <Link
              href={`/${project.slug}/roadmap`}
              className="text-sm font-medium text-primary border-b-2 border-primary pb-1"
            >
              Roadmap
            </Link>
            <Link
              href={`/${project.slug}/changelog`}
              className="text-sm text-sand-600 hover:text-sand-900 pb-1"
            >
              Changelog
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {renderSection('In Progress', 'in_progress', inProgressItems)}
        {renderSection('Planned', 'planned', plannedItems)}

        {plannedItems.length === 0 && inProgressItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sand-600">Nothing on the roadmap yet. Check back soon!</p>
          </div>
        )}
      </main>

      <footer className="border-t border-sand-200 mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-sand-500">
            Powered by{' '}
            <Link href="/" className="text-sand-700 hover:text-sand-900">
              shipped.fyi
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
