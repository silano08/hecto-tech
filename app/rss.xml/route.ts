import { getPosts } from '@/lib/get-posts'

const CONFIG = {
  title: '헥토파이낸셜 기술 블로그',
  siteUrl: 'https://tech.hectofinancial.co.kr',
  description: 'Latest blog posts',
  lang: 'en-us'
}

export async function GET() {
  const allPosts = await getPosts()
  const posts = allPosts
    .filter(post => post.frontMatter?.date)
    .map(
      post => `    <item>
        <title>${post.frontMatter?.title || post.title || 'Untitled'}</title>
        <description>${post.frontMatter?.description || ''}</description>
        <link>${CONFIG.siteUrl}${post.route}</link>
        <pubDate>${new Date(post.frontMatter.date!).toUTCString()}</pubDate>
    </item>`
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${CONFIG.title}</title>
    <link>${CONFIG.siteUrl}</link>
    <description>${CONFIG.description}</description>
    <language>${CONFIG.lang}</language>
${posts}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml'
    }
  })
}
