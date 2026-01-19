import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  currentPage: number
  totalPages: number
  basePath?: string
}

export default function Pagination({ currentPage, totalPages, basePath = '' }: Props) {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    if (page === 1) return basePath || '/'
    return `${basePath}?page=${page}`
  }

  const pages: (number | 'ellipsis')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }

    pages.push(totalPages)
  }

  return (
    <nav className="flex justify-center items-center gap-1 mt-12">
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground"
          aria-label="이전 페이지"
        >
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <span className="p-2 text-muted opacity-50">
          <ChevronLeft size={20} />
        </span>
      )}

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={`px-3 py-2 rounded-md ${
              page === currentPage
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground'
            }`}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground"
          aria-label="다음 페이지"
        >
          <ChevronRight size={20} />
        </Link>
      ) : (
        <span className="p-2 text-muted opacity-50">
          <ChevronRight size={20} />
        </span>
      )}
    </nav>
  )
}
