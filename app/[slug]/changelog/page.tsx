import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ChangelogPage({ params }: Props) {
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
    .eq('status', 'shipped')
    .order('shipped_at', { ascending: false })

  // Group items by date
  type ItemType = NonNullable<typeof items>[number]
  const groupedItems = items?.reduce<Record<string, ItemType[]>>((acc, item) => {
    const date = item.shipped_at
      ? new Date(item.shipped_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Unknown date'
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-sand-50">
      <header className="bg-white border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-sand-900">{project.name}</h1>
          <p className="text-sand-600 mt-1">What we&apos;ve shipped</p>
          <nav className="flex gap-4 mt-4">
            <Link
              href={`/${project.slug}`}
              className="text-sm text-sand-600 hover:text-sand-900 pb-1"
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
              className="text-sm font-medium text-primary border-b-2 border-primary pb-1"
            >
              Changelog
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {groupedItems && Object.keys(groupedItems).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([date, dateItems]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h2 className="text-lg font-medium text-sand-900">{date}</h2>
                </div>
                <div className="space-y-3 ml-6 pl-6 border-l-2 border-sand-200">
                  {dateItems?.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Shipped
                          </span>
                          <span className="text-sm text-sand-500">{item.vote_count} votes</span>
                        </div>
                        <h3 className="font-medium text-sand-900 mt-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-sand-600 mt-1">{item.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sand-600">Nothing shipped yet. Check back soon!</p>
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
