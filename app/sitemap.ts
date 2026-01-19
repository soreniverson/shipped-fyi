import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shipped.fyi'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic project pages
  try {
    const supabase = await createClient()
    const { data: projects } = await supabase
      .from('projects')
      .select('slug, created_at')

    const projectPages: MetadataRoute.Sitemap = (projects || []).flatMap((project) => [
      {
        url: `${baseUrl}/${project.slug}`,
        lastModified: new Date(project.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/${project.slug}/roadmap`,
        lastModified: new Date(project.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/${project.slug}/changelog`,
        lastModified: new Date(project.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      },
    ])

    return [...staticPages, ...projectPages]
  } catch {
    return staticPages
  }
}
