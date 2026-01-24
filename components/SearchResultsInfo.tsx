'use client'

import { useLanguage } from './LanguageProvider'
import type { Category } from '@/types/post'

const CATEGORY_EN: Record<Category, string> = {
  '전체': 'All',
  'AI': 'AI',
  '인프라': 'Infra',
  '보안': 'Security',
  '개발': 'Dev'
}

interface SearchResultsInfoProps {
  query?: string
  category: Category
  totalPosts: number
}

export default function SearchResultsInfo({ query, category, totalPosts }: SearchResultsInfoProps) {
  const { language } = useLanguage()

  if (!query && category === '전체') return null

  const categoryLabel = language === 'ko' ? category : CATEGORY_EN[category]

  return (
    <section className="mb-6">
      <p className="text-sm text-muted">
        {query && (
          <span>
            "{query}" {language === 'ko' ? '검색 결과' : 'results'}
          </span>
        )}
        {query && category !== '전체' && <span> · </span>}
        {category !== '전체' && (
          <span>
            {categoryLabel} {language === 'ko' ? '카테고리' : 'category'}
          </span>
        )}
        <span className="ml-2">
          ({totalPosts}{language === 'ko' ? '개의 글' : ' posts'})
        </span>
      </p>
    </section>
  )
}
