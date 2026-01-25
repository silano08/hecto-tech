'use client'

import Link from 'next/link'
import { User, CheckCircle, Users } from 'lucide-react'
import ShareButtons from '@/components/ShareButtons'
import { useLanguage } from './LanguageProvider'

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
  const { language } = useLanguage()
  const t = (ko: string, en: string) => language === 'ko' ? ko : en

  const hasAuthors = authors && authors.length > 0
  const hasReviewer = reviewer && reviewer.trim() !== ''
  const hasContributors = contributors && contributors.length > 0
  const hasTags = tags && tags.length > 0
  const hasAnyMeta = hasAuthors || hasReviewer || hasContributors || hasTags

  if (!hasAnyMeta) return null

  return (
    <aside className="hidden lg:block sticky top-8 text-sm">
      <div className="space-y-6">
        {/* Author */}
        {hasAuthors && (
          <div>
            <div className="flex items-center gap-2 text-muted mb-2">
              <User size={14} />
              <span className="text-xs uppercase tracking-wide font-medium">{t('작성자', 'Author')}</span>
            </div>
            <div className="text-foreground">
              {authors.join(', ')}
            </div>
          </div>
        )}

        {/* Reviewer */}
        {hasReviewer && (
          <div>
            <div className="flex items-center gap-2 text-muted mb-2">
              <CheckCircle size={14} />
              <span className="text-xs uppercase tracking-wide font-medium">{t('검수자', 'Reviewer')}</span>
            </div>
            <div className="text-foreground">{reviewer}</div>
          </div>
        )}

        {/* Contributors */}
        {hasContributors && (
          <div>
            <div className="flex items-center gap-2 text-muted mb-2">
              <Users size={14} />
              <span className="text-xs uppercase tracking-wide font-medium">{t('기여자', 'Contributors')}</span>
            </div>
            <div className="text-foreground">
              {contributors.join(', ')}
            </div>
          </div>
        )}

        {/* Tags */}
        {hasTags && (
          <div>
            <p className="text-xs uppercase tracking-wide font-medium text-muted mb-2">
              {t('태그', 'Tags')}
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

        {/* Share */}
        <div className="pt-4 border-t border-border">
          <ShareButtons title={title} />
        </div>

        {/* Ad Banner */}
        <div className="pt-4">
          <Link
            href="https://web.ttobakcare.com/?srsltid=AfmBOord3G6iZRgGWSIcTGbHL0Vu5n3_4Fype1UuXdqPyKCi6qP6Dm0H"
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
          >
            <img
              src="https://web.ttobakcare.com/filesV2/layout/202601/20260105093835565_fa5.jpg"
              alt="Ad"
              className="w-full h-auto"
            />
          </Link>
        </div>
      </div>
    </aside>
  )
}
