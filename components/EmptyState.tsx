'use client'

import { useLanguage } from './LanguageProvider'

export default function EmptyState() {
  const { language } = useLanguage()

  return (
    <div className="py-12 text-center">
      <p className="text-muted text-lg">
        {language === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}
      </p>
      <p className="text-muted text-sm mt-2">
        {language === 'ko'
          ? '다른 검색어나 카테고리를 시도해보세요.'
          : 'Try a different search term or category.'}
      </p>
    </div>
  )
}
