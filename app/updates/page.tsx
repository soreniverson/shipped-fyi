import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { getChangelogByMonth } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Updates | shipped.fyi',
  description: 'See what we\'ve shipped. Product updates and new features for shipped.fyi.',
  openGraph: {
    title: 'Updates | shipped.fyi',
    description: 'See what we\'ve shipped. Product updates and new features for shipped.fyi.',
    type: 'website',
  },
}

export default function UpdatesPage() {
  const changelogByMonth = getChangelogByMonth()

  return (
    <div className="min-h-screen bg-sand-50 relative">
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
            <Link href="/blog" className="text-sm text-sand-600 hover:text-sand-900">
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
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-sand-900 mb-4">Updates</h1>
          <p className="text-lg text-sand-600 mb-12">
            See what we&apos;ve shipped. New features and improvements to shipped.fyi.
          </p>

          {changelogByMonth.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sand-500">No updates yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {changelogByMonth.map(({ month, posts }) => (
                <div key={month}>
                  <h2 className="text-sm font-medium text-sand-500 uppercase tracking-wide mb-6">
                    {month}
                  </h2>
                  <div className="space-y-6">
                    {posts.map((post) => {
                      const formattedDate = new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                      return (
                        <div
                          key={post.slug}
                          className="relative pl-6 border-l-2 border-sand-200"
                        >
                          <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-sand-400"></div>
                          <div className="flex items-center gap-3 text-sm text-sand-500 mb-2">
                            <time dateTime={post.frontmatter.date}>{formattedDate}</time>
                            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                              <>
                                <span className="text-sand-300">·</span>
                                {post.frontmatter.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-sand-100 text-sand-600 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-sand-900 mb-2">
                            {post.frontmatter.title}
                          </h3>
                          <p className="text-sand-600 text-sm leading-relaxed">
                            {post.frontmatter.description}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
