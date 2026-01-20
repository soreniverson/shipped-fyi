import { getAllPosts } from '@/lib/posts'

export async function GET() {
  const posts = getAllPosts() // All posts (blog + changelog)
  const baseUrl = 'https://shipped.fyi'

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const rssItems = posts
    .map((post) => {
      const url =
        post.frontmatter.type === 'post'
          ? `${baseUrl}/blog/${post.slug}`
          : `${baseUrl}/updates#${post.slug}`

      return `
    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.frontmatter.description)}</description>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <category>${post.frontmatter.type === 'post' ? 'Blog' : 'Changelog'}</category>
      ${post.frontmatter.tags?.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ') || ''}
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>shipped.fyi Blog &amp; Updates</title>
    <link>${baseUrl}</link>
    <description>Product feedback insights, guides, and product updates from shipped.fyi</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon.png</url>
      <title>shipped.fyi</title>
      <link>${baseUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
