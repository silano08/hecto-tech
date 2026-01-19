'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  value: string
  depth: number
}

interface TocProps {
  toc: TocItem[]
}

export default function Toc({ toc }: TocProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0% 0% -80% 0%' }
    )

    toc.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [toc])

  if (!toc || toc.length === 0) return null

  return (
    <nav className="text-sm border-l-2 border-border pl-4">
      <p className="font-semibold mb-3 text-foreground text-xs uppercase tracking-wide">
        목차
      </p>
      <ul className="list-none p-0 m-0">
        {toc.map((item) => (
          <li
            key={item.id}
            className="mb-2"
            style={{ paddingLeft: `${(item.depth - 2) * 0.75}rem` }}
          >
            <a
              href={`#${item.id}`}
              className={`block transition-colors ${
                activeId === item.id
                  ? 'text-primary border-l-2 border-primary -ml-[1.125rem] pl-[0.875rem]'
                  : 'text-muted'
              }`}
            >
              {item.value}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
