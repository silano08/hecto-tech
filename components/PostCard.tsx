import Link from 'next/link'

interface PostCardProps {
  post: {
    route: string
    title?: string
    frontMatter?: {
      title?: string
      description?: string
      date?: string
      tags?: string[]
    }
  }
}

export default function PostCard({ post }: PostCardProps) {
  const title = post.frontMatter?.title || post.title || 'Untitled'
  const description = post.frontMatter?.description
  const date = post.frontMatter?.date
  const tags = post.frontMatter?.tags

  return (
    <article className="border-b border-border py-6">
      <Link href={post.route} className="no-underline">
        <h2 className="text-xl font-semibold text-foreground mb-2 mt-0 border-0 pb-0">
          {title}
        </h2>
      </Link>

      {description && (
        <p className="text-muted text-base mb-3 leading-relaxed">
          {description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 sm:gap-4 items-center text-sm text-muted">
        {date && (
          <time>{new Date(date).toLocaleDateString('ko-KR')}</time>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="bg-primary text-white px-2 py-0.5 rounded text-xs"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
