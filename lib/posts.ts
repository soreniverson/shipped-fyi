import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export type PostType = 'post' | 'changelog'

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  type: PostType
  author?: string
  tags?: string[]
  image?: string
}

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  content: string
  readingTime: string
}

export interface PostMeta {
  slug: string
  frontmatter: PostFrontmatter
  readingTime: string
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.mdx'))
}

export function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    frontmatter: data as PostFrontmatter,
    content,
    readingTime: readingTime(content).text,
  }
}

export function getAllPosts(type?: PostType): PostMeta[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug.replace(/\.mdx$/, ''))
      if (!post) return null
      return {
        slug: post.slug,
        frontmatter: post.frontmatter,
        readingTime: post.readingTime,
      }
    })
    .filter((post): post is PostMeta => post !== null)
    .filter((post) => !type || post.frontmatter.type === type)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())

  return posts
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => post.frontmatter.tags?.includes(tag))
}

// Group changelog posts by month/year for timeline display
export function getChangelogByMonth(): { month: string; posts: PostMeta[] }[] {
  const posts = getAllPosts('changelog')
  const grouped = new Map<string, PostMeta[]>()

  posts.forEach((post) => {
    const date = new Date(post.frontmatter.date)
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const existing = grouped.get(monthKey) || []
    grouped.set(monthKey, [...existing, post])
  })

  return Array.from(grouped.entries()).map(([month, posts]) => ({ month, posts }))
}
