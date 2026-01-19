import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WidgetBoard } from './WidgetBoard'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function WidgetPage({ params }: Props) {
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
    .in('status', ['considering', 'planned', 'in_progress'])
    .order('vote_count', { ascending: false })
    .limit(10)

  return (
    <html lang="en">
      <body className="bg-white">
        <WidgetBoard project={project} initialItems={items || []} />
      </body>
    </html>
  )
}
