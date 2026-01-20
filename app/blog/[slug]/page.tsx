import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PostBody } from '@/components/PostBody'
import { getPostBySlug, getPostSlugs } from '@/lib/posts'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { getAllPosts } = await import('@/lib/posts')
  const posts = getAllPosts('post')
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.frontmatter.title} | shipped.fyi`,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
      publishedTime: post.frontmatter.date,
      authors: [post.frontmatter.author || 'shipped.fyi'],
      ...(post.frontmatter.image && { images: [post.frontmatter.image] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      ...(post.frontmatter.image && { images: [post.frontmatter.image] }),
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post || post.frontmatter.type !== 'post') {
    notFound()
  }

  const formattedDate = new Date(post.frontmatter.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.date,
    author: {
      '@type': 'Organization',
      name: post.frontmatter.author || 'shipped.fyi',
    },
    publisher: {
      '@type': 'Organization',
      name: 'shipped.fyi',
      url: 'https://shipped.fyi',
    },
    ...(post.frontmatter.image && { image: post.frontmatter.image }),
  }

  return (
    <div className="min-h-screen bg-sand-50 relative">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Vertical grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="max-w-4xl mx-auto h-full relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-sand-200"></div>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-sand-200"></div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-sand-900">shipped.fyi</Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-sand-900 font-medium">
              Blog
            </Link>
            <Link href="/pricing" className="text-sm text-sand-600 hover:text-sand-900">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-sand-600 hover:text-sand-900">
              Sign in
            </Link>
            <Link href="/login">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 relative">
        <article className="max-w-3xl">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-sand-500 hover:text-sand-700 mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to blog
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 text-sm text-sand-500 mb-4">
              <time dateTime={post.frontmatter.date}>{formattedDate}</time>
              <span className="text-sand-300">·</span>
              <span>{post.readingTime}</span>
              {post.frontmatter.author && (
                <>
                  <span className="text-sand-300">·</span>
                  <span>{post.frontmatter.author}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-sand-900 leading-tight">
              {post.frontmatter.title}
            </h1>
            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-sand-100 text-sand-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Body */}
          <PostBody content={post.content} />
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200 relative">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-sand-900 font-medium">shipped.fyi</span>
              <p className="text-sand-500 text-sm mt-1">Simple feedback for indie hackers</p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/blog" className="text-sm text-sand-600 hover:text-sand-900">
                Blog
              </Link>
              <Link href="/updates" className="text-sm text-sand-600 hover:text-sand-900">
                Updates
              </Link>
              <Link href="/pricing" className="text-sm text-sand-600 hover:text-sand-900">
                Pricing
              </Link>
              <Link href="/terms" className="text-sm text-sand-600 hover:text-sand-900">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-sand-600 hover:text-sand-900">
                Privacy
              </Link>
              <Link href="/login" className="text-sm text-sand-600 hover:text-sand-900">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
