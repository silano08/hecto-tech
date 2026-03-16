'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from './LanguageProvider'
import type { PostFrontMatter } from '@/types/post'

interface PostCardProps {
  post: {
    route: string
    title?: string
    frontMatter?: PostFrontMatter
    readingTime?: number
  }
}

export default function PostCard({ post }: PostCardProps) {
  const { language } = useLanguage()
  const title = post.frontMatter?.title || post.title || 'Untitled'
  const description = post.frontMatter?.description
  const date = post.frontMatter?.date
  const authors = post.frontMatter?.authors?.length
    ? post.frontMatter.authors
    : post.frontMatter?.author
      ? [post.frontMatter.author]
      : undefined
  const tags = post.frontMatter?.tags
  const thumbnail = post.frontMatter?.thumbnail
  const readingTime = post.readingTime

  const formatDate = (dateStr: string) => {
    const locale = language === 'ko' ? 'ko-KR' : 'en-US'
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <article className="border-b border-border py-6">
      <div className="flex gap-4 sm:gap-6">
        {/* 썸네일 */}
        <div className="flex-shrink-0">
          <Link href={post.route} className="block">
            {thumbnail ? (
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={thumbnail}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-primary">H</span>
              </div>
            )}
          </Link>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <Link href={post.route} className="no-underline">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2 mt-0 border-0 pb-0 line-clamp-2">
              {title}
            </h2>
          </Link>

          {description && (
            <p className="text-muted text-sm sm:text-base mb-2 sm:mb-3 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-1 sm:gap-2 items-center text-xs sm:text-sm text-muted">
            {authors && authors.length > 0 && (
              <span>{authors.join(', ')}</span>
            )}
            {authors && authors.length > 0 && date && (
              <span className="text-border">|</span>
            )}
            {date && (
              <time>{formatDate(date)}</time>
            )}
            {((authors && authors.length > 0) || date) && readingTime && (
              <span className="text-border">|</span>
            )}
            {readingTime && (
              <span>{readingTime} min read</span>
            )}
            {((authors && authors.length > 0) || date || readingTime) && tags && tags.length > 0 && (
              <span className="text-border">|</span>
            )}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-primary">#{tag}</span>
                ))}
                {tags.length > 3 && (
                  <span className="text-muted">+{tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
