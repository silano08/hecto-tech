'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PenSquare } from 'lucide-react'

export default function WriteButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) setIsLoggedIn(true)
      })
      .catch(() => {})
  }, [])

  if (isLoggedIn) {
    return (
      <Link
        href="/write"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <PenSquare size={14} />
        <span className="hidden sm:inline">글쓰기</span>
      </Link>
    )
  }

  return (
    <a
      href="/api/auth/github"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <PenSquare size={14} />
      <span className="hidden sm:inline">글쓰기</span>
    </a>
  )
}
