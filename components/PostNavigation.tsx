import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPosts } from '@/lib/get-posts'

interface PostNavigationProps {
  currentDate: string
}

export default async function PostNavigation({ currentDate }: PostNavigationProps) {
  const posts = await getPosts()
  const currentIndex = posts.findIndex(post => post.frontMatter.date === currentDate)

  if (currentIndex === -1) return null

  const prevPost = posts[currentIndex + 1]
  const nextPost = posts[currentIndex - 1]

  if (!prevPost && !nextPost) return null

  return (
    <nav className="mt-12 grid grid-cols-2 gap-4">
      {prevPost ? (
        <Link
          href={prevPost.route}
          className="group flex flex-col p-4 rounded-lg border border-border hover:border-primary transition-colors"
        >
          <span className="flex items-center gap-1 text-sm text-muted mb-1">
            <ChevronLeft size={16} />
            이전 글
          </span>
          <span className="font-medium group-hover:text-primary transition-colors line-clamp-2">
            {prevPost.frontMatter.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {nextPost ? (
        <Link
          href={nextPost.route}
          className="group flex flex-col items-end text-right p-4 rounded-lg border border-border hover:border-primary transition-colors"
        >
          <span className="flex items-center gap-1 text-sm text-muted mb-1">
            다음 글
            <ChevronRight size={16} />
          </span>
          <span className="font-medium group-hover:text-primary transition-colors line-clamp-2">
            {nextPost.frontMatter.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}
