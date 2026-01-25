'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from './LanguageProvider'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="px-2 py-1 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-50"
        aria-label="Toggle language"
      >
        KO
      </button>
    )
  }

  return (
    <button
      onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
      className="px-2 py-1 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle language"
    >
      {language === 'ko' ? 'KO' : 'EN'}
    </button>
  )
}
