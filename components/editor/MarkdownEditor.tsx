'use client'

import { useRef } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }

  const wordCount = value.trim().split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <span className="text-xs font-medium text-muted">Markdown</span>
        <span className="text-xs text-muted">{wordCount} 단어</span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="마크다운으로 글을 작성하세요..."
        className="flex-1 w-full p-4 bg-background text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none rounded-b-lg border border-t-0 border-border min-h-[400px]"
        style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        spellCheck={false}
      />
    </div>
  )
}
