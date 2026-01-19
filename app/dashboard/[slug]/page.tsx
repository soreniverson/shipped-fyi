import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ProjectManager } from './ProjectManager'
import { Category } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!project) {
    notFound()
  }

  if (project.owner_id !== user.id) {
    redirect('/dashboard')
  }

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from('items')
      .select('*')
      .eq('project_id', project.id)
      .order('vote_count', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('project_id', project.id)
      .order('name')
  ])

  // Map categories to items
  const categoryMap = new Map((categories || []).map((c: Category) => [c.id, c]))
  const itemsWithCategories = (items || []).map((item) => ({
    ...item,
    category: item.category_id ? categoryMap.get(item.category_id) : null
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-sand-900">{project.name}</h1>
        <p className="text-sand-500 mt-1">
          Public board:{' '}
          <Link href={`/${project.slug}`} className="text-sand-700 hover:text-sand-900 underline" target="_blank">
            /{project.slug}
          </Link>
        </p>
      </div>

      <ProjectManager
        project={project}
        initialItems={itemsWithCategories}
        initialCategories={categories || []}
      />
    </div>
  )
}
