import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import Toc from '@/components/Toc'
import Comments from '@/components/Comments'

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

export default function ArticleLayout({ children, toc }: ArticleLayoutProps) {
  const hasToc = toc && toc.length > 0

  return (
    <div className={`grid gap-12 items-start ${hasToc ? 'grid-cols-[1fr_220px]' : 'grid-cols-1'}`}>
      <article className="min-w-0">
        {children}

        <div className="mt-16 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-border">
          <p className="text-lg font-semibold mb-2">
            <span className="text-primary">Hecto Financial</span>에서 함께할 동료를 찾습니다
          </p>
          <p className="text-muted mb-4">
            금융의 새로운 기준을 만들어가는 여정에 함께하세요.
          </p>
          <Link
            href="https://www.hectocareers.co.kr/join?divisions=%28%EC%A3%BC%29%ED%97%A5%ED%86%A0%ED%8C%8C%EC%9D%B4%EB%82%B8%EC%85%9C"
            target="_blank"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-medium"
          >
            채용 공고 보기
            <ExternalLink size={16} />
          </Link>
        </div>

        <div className="mt-12">
          <Comments />
        </div>
      </article>
      {hasToc && (
        <aside className="sticky top-8">
          <Toc toc={toc} />
        </aside>
      )}
    </div>
  )
}
