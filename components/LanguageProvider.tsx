'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ko' | 'en'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (ko: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language
    if (stored && (stored === 'ko' || stored === 'en')) {
      setLanguageState(stored)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (ko: string, en: string) => {
    if (!mounted) return ko
    return language === 'ko' ? ko : en
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
