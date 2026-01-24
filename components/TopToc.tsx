'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TocItem {
  id: string
  value: string
  depth: number
}

interface TopTocProps {
  toc: TocItem[]
}

export default function TopToc({ toc }: TopTocProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!toc || toc.length === 0) return null

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <div className="mb-8 border border-border rounded-lg bg-gray-50 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-medium text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <span className="text-sm">목차</span>
        {isOpen ? (
          <ChevronUp size={18} className="text-muted" />
        ) : (
          <ChevronDown size={18} className="text-muted" />
        )}
      </button>

      {isOpen && (
        <nav className="px-4 pb-4">
          <ul className="list-none p-0 m-0 space-y-2">
            {toc.map((item) => (
              <li
                key={item.id}
                style={{ paddingLeft: `${(item.depth - 2) * 1}rem` }}
              >
                <button
                  type="button"
                  onClick={() => handleClick(item.id)}
                  className="text-sm text-muted hover:text-primary transition-colors text-left"
                >
                  {item.value}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
