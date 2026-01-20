import Link from 'next/link'
import { PostMeta } from '@/lib/posts'

interface PostCardProps {
  post: PostMeta
  basePath?: string
}

export function PostCard({ post, basePath = '/blog' }: PostCardProps) {
  const formattedDate = new Date(post.frontmatter.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link href={`${basePath}/${post.slug}`} className="block group">
      <article className="bg-white rounded-xl border border-sand-200 p-6 transition-all hover:border-sand-300 hover:shadow-sm">
        <div className="flex items-center gap-3 text-sm text-sand-500 mb-3">
          <time dateTime={post.frontmatter.date}>{formattedDate}</time>
          <span className="text-sand-300">·</span>
          <span>{post.readingTime}</span>
        </div>
        <h2 className="text-lg font-semibold text-sand-900 group-hover:text-sand-700 transition-colors mb-2">
          {post.frontmatter.title}
        </h2>
        <p className="text-sand-600 text-sm leading-relaxed line-clamp-2">
          {post.frontmatter.description}
        </p>
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
      </article>
    </Link>
  )
}
