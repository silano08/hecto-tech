import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import Toc from '@/components/Toc'
import Comments from '@/components/Comments'
import PostNavigation from '@/components/PostNavigation'
import RelatedPosts from '@/components/RelatedPosts'
import ShareButtons from '@/components/ShareButtons'

interface TocItem {
  id: string
  value: string
  depth: number
}

interface ArticleLayoutProps {
  children: React.ReactNode
  toc?: TocItem[]
  metadata?: Record<string, unknown>
}

export default function ArticleLayout({ children, toc, metadata }: ArticleLayoutProps) {
  const hasToc = toc && toc.length > 0
  const title = metadata?.title as string | undefined
  const date = metadata?.date as string | undefined
  const tags = metadata?.tags as string[] | undefined

  return (
    <div className={`grid gap-8 lg:gap-12 items-start ${hasToc ? 'lg:grid-cols-[1fr_220px]' : 'grid-cols-1'}`}>
      <article className="min-w-0">
        {children}

        {(title || tags) && (
          <div className="mt-8 lg:mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="bg-gray-100 dark:bg-gray-800 text-foreground px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
            {title && <ShareButtons title={title} />}
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
      {hasToc && (
        <aside className="hidden lg:block sticky top-8">
          <Toc toc={toc} />
        </aside>
      )}
    </div>
  )
}
