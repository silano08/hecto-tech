'use client'

import { useRef, useState, useEffect, type ComponentPropsWithoutRef } from 'react'
import CopyButton from '@/components/CopyButton'

const languageNames: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  md: 'Markdown',
  markdown: 'Markdown',
  mdx: 'MDX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  go: 'Go',
  golang: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  kt: 'Kotlin',
  swift: 'Swift',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  cs: 'C#',
  csharp: 'C#',
  php: 'PHP',
  sql: 'SQL',
  sh: 'Shell',
  shell: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  xml: 'XML',
  graphql: 'GraphQL',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
}

interface CodeBlockProps extends ComponentPropsWithoutRef<'pre'> {
  'data-language'?: string
}

export default function CodeBlock(props: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const [language, setLanguage] = useState<string | null>(null)

  // props에서 직접 가져오거나, DOM에서 찾기
  const propsLanguage = props['data-language']

  useEffect(() => {
    if (propsLanguage) {
      setLanguage(propsLanguage)
      return
    }
    // fallback: DOM에서 찾기
    const pre = preRef.current
    const codeEl = pre?.querySelector('code')
    const lang = pre?.getAttribute('data-language') || codeEl?.getAttribute('data-language')
    if (lang) {
      setLanguage(lang)
    }
  }, [propsLanguage])

  const getCodeText = () => {
    return preRef.current?.textContent ?? ''
  }

  const displayLanguage = language ? (languageNames[language] || language) : null

  return (
    <div className="relative group">
      {displayLanguage && (
        <div className="bg-gray-800 text-gray-400 text-xs font-medium px-4 py-2 rounded-t-lg border-b border-gray-700">
          {displayLanguage}
        </div>
      )}
      <pre ref={preRef} {...props} className={`${props.className || ''} ${displayLanguage ? '!rounded-t-none !mt-0' : ''}`} />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton getText={getCodeText} />
      </div>
    </div>
  )
}
