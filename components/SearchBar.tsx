'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

interface SearchBarProps {
  placeholder?: string
}

export default function SearchBar({ placeholder = '제목, 설명, 태그 검색...' }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const updateUrl = useCallback((newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newQuery.trim()) {
      params.set('q', newQuery)
    } else {
      params.delete('q')
    }

    // Reset page when searching
    params.delete('page')

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }, [router, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl(query)
  }

  const handleClear = () => {
    setQuery('')
    updateUrl('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            aria-label="검색어 지우기"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </form>
  )
}
