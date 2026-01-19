import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PublicBoard } from './PublicBoard'
import { Category } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ slug: string }>
}

async function getOwnerPlan(ownerId: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', ownerId)
    .single()
  return data?.plan || 'free'
}

export default async function PublicBoardPage({ params }: Props) {
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

  const [{ data: items }, { data: categories }, ownerPlan] = await Promise.all([
    supabase
      .from('items')
      .select('*')
      .eq('project_id', project.id)
      .in('status', ['considering', 'planned', 'in_progress'])
      .order('vote_count', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('project_id', project.id)
      .order('name'),
    getOwnerPlan(project.owner_id, supabase)
  ])

  const showPoweredBy = ownerPlan === 'free'

  // Map categories to items
  const categoryMap = new Map((categories || []).map((c: Category) => [c.id, c]))
  const itemsWithCategories = (items || []).map((item) => ({
    ...item,
    category: item.category_id ? categoryMap.get(item.category_id) : null
  }))

  return (
    <div className="min-h-screen bg-sand-50">
      <header className="bg-white border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-sand-900">{project.name}</h1>
          <p className="text-sand-600 mt-1">Share your ideas and vote on what we should build next</p>
          <nav className="flex gap-4 mt-4">
            <Link
              href={`/${project.slug}`}
              className="text-sm font-medium text-primary border-b-2 border-primary pb-1"
            >
              Feedback
            </Link>
            <Link
              href={`/${project.slug}/roadmap`}
              className="text-sm text-sand-600 hover:text-sand-900 pb-1"
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
        <PublicBoard
          project={project}
          initialItems={itemsWithCategories}
          categories={categories || []}
        />
      </main>

      {showPoweredBy && (
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
      )}
    </div>
  )
}
