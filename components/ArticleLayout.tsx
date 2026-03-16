import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import TopToc from '@/components/TopToc'
import ArticleSidebar from '@/components/ArticleSidebar'
import Comments from '@/components/Comments'
import PostNavigation from '@/components/PostNavigation'
import RelatedPosts from '@/components/RelatedPosts'
import { calculateReadingTime } from '@/lib/reading-time'

interface TocItem {
  id: string
  value: string
  depth: number
}

interface ArticleLayoutProps {
  children: React.ReactNode
  toc?: TocItem[]
  metadata?: Record<string, unknown>
  sourceCode?: string
}

export default function ArticleLayout({ children, toc, metadata, sourceCode }: ArticleLayoutProps) {
  const hasToc = toc && toc.length > 0
  const title = metadata?.title as string | undefined
  const date = metadata?.date as string | undefined
  const tags = metadata?.tags as string[] | undefined
  const metaAuthors = metadata?.authors as string[] | undefined
  const metaAuthor = metadata?.author as string | undefined
  const authors = metaAuthors?.length ? metaAuthors : metaAuthor ? [metaAuthor] : undefined
  const reviewer = metadata?.reviewer as string | undefined
  const contributors = metadata?.contributors as string[] | undefined
  const readingTime = sourceCode ? calculateReadingTime(sourceCode) : undefined

  return (
    <div className={`grid gap-8 lg:gap-12 items-start ${hasToc ? 'lg:grid-cols-[1fr_200px]' : 'grid-cols-1'}`}>
      <article className="min-w-0">
        {title && (
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 mt-0">{title}</h1>
        )}
        {(authors || date) && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-6">
            {authors && authors.length > 0 && (
              <span className="font-medium text-foreground">{authors.join(', ')}</span>
            )}
            {authors && date && <span>·</span>}
            {date && (
              <time>{new Date(date).toLocaleDateString('ko-KR')}</time>
            )}
            {readingTime && (
              <>
                <span>·</span>
                <span>{readingTime} min read</span>
              </>
            )}
          </div>
        )}

        {/* 상단 접이식 목차 */}
        {hasToc && <TopToc toc={toc} />}

        <div>
          {children}
        </div>

        {(title || tags) && (
          <div className="mt-8 lg:mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 lg:hidden">
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="bg-gray-100 dark:bg-gray-800 text-foreground px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-border">
          <p className="text-base lg:text-lg font-semibold mb-2">
            <span className="text-primary">Hecto Financial</span>에서 함께할 동료를 찾습니다
          </p>
          <p className="text-muted text-sm lg:text-base mb-4">
            금융의 새로운 기준을 만들어가는 여정에 함께하세요.
          </p>
          <Link
            href="https://www.hectocareers.co.kr/join?divisions=%28%EC%A3%BC%29%ED%97%A5%ED%86%A0%ED%8C%8C%EC%9D%B4%EB%82%B8%EC%85%9C"
            target="_blank"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-medium text-sm lg:text-base"
          >
            채용 공고 보기
            <ExternalLink size={16} />
          </Link>
        </div>

        {date && <PostNavigation currentDate={date} />}

        {date && tags && <RelatedPosts currentDate={date} tags={tags} />}

        <div className="mt-8 lg:mt-12">
          <Comments />
        </div>
      </article>

      {/* 우측 사이드바: 메타정보 + 공유 */}
      {hasToc && title && (
        <ArticleSidebar
          authors={authors}
          reviewer={reviewer}
          contributors={contributors}
          tags={tags}
          title={title}
        />
      )}
    </div>
  )
}
