import Link from 'next/link'
import { getPosts } from '@/lib/get-posts'

interface RelatedPostsProps {
  currentDate: string
  tags: string[]
}

export default async function RelatedPosts({ currentDate, tags }: RelatedPostsProps) {
  if (!tags || tags.length === 0) return null

  const posts = await getPosts()

  const relatedPosts = posts
    .filter(post => post.frontMatter.date !== currentDate)
    .filter(post => {
      const postTags = post.frontMatter.tags as string[]
      return postTags?.some(tag => tags.includes(tag))
    })
    .slice(0, 3)

  if (relatedPosts.length === 0) return null

  return (
    <div className="mt-12">
      <h3 className="text-lg font-semibold mb-4">관련 포스트</h3>
      <div className="grid gap-3">
        {relatedPosts.map(post => (
          <Link
            key={post.route}
            href={post.route}
            className="group flex flex-col p-4 rounded-lg border border-border hover:border-primary transition-colors"
          >
            <span className="font-medium group-hover:text-primary transition-colors">
              {post.frontMatter.title}
            </span>
            <span className="text-sm text-muted mt-1 line-clamp-1">
              {post.frontMatter.description}
            </span>
            <div className="flex gap-2 mt-2">
              {(post.frontMatter.tags as string[])?.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
