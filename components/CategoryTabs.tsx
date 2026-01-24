'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES, type Category } from '@/types/post'

interface CategoryTabsProps {
  currentCategory?: Category
}

export default function CategoryTabs({ currentCategory = '전체' }: CategoryTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: Category) => {
    const params = new URLSearchParams(searchParams.toString())

    if (category === '전체') {
      params.delete('category')
    } else {
      params.set('category', category)
    }

    // Reset page when changing category
    params.delete('page')

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => handleCategoryChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentCategory === category
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
