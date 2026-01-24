'use client'

import Link from 'next/link'
import { User, CheckCircle, Users } from 'lucide-react'
import ShareButtons from '@/components/ShareButtons'

interface ArticleSidebarProps {
  authors?: string[]
  reviewer?: string
  contributors?: string[]
  tags?: string[]
  title: string
}

export default function ArticleSidebar({
  authors,
  reviewer,
  contributors,
  tags,
  title
}: ArticleSidebarProps) {
  const hasAuthors = authors && authors.length > 0
  const hasReviewer = reviewer && reviewer.trim() !== ''
  const hasContributors = contributors && contributors.length > 0
  const hasTags = tags && tags.length > 0
  const hasAnyMeta = hasAuthors || hasReviewer || hasContributors || hasTags

  if (!hasAnyMeta) return null

  return (
    <aside className="hidden lg:block sticky top-8 text-sm">
      <div className="space-y-6">
        {/* 작성자 */}
        {hasAuthors && (
          <div>
            <div className="flex items-center gap-2 text-muted mb-2">
              <User size={14} />
              <span className="text-xs uppercase tracking-wide font-medium">작성자</span>
            </div>
            <div className="text-foreground">
              {authors.join(', ')}
            </div>
          </div>
        )}

        {/* 검수자 */}
        {hasReviewer && (
          <div>
            <div className="flex items-center gap-2 text-muted mb-2">
              <CheckCircle size={14} />
              <span className="text-xs uppercase tracking-wide font-medium">검수자</span>
            </div>
            <div className="text-foreground">{reviewer}</div>
          </div>
        )}

        {/* 기여자 */}
        {hasContributors && (
          <div>
            <div className="flex items-center gap-2 text-muted mb-2">
              <Users size={14} />
              <span className="text-xs uppercase tracking-wide font-medium">기여자</span>
            </div>
            <div className="text-foreground">
              {contributors.join(', ')}
            </div>
          </div>
        )}

        {/* 태그 */}
        {hasTags && (
          <div>
            <p className="text-xs uppercase tracking-wide font-medium text-muted mb-2">
              태그
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="bg-gray-100 dark:bg-gray-800 text-foreground px-2 py-1 rounded text-xs hover:bg-primary hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 공유 */}
        <div className="pt-4 border-t border-border">
          <ShareButtons title={title} />
        </div>
      </div>
    </aside>
  )
}
