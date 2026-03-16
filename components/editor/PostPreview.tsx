'use client'

import ReactMarkdown from 'react-markdown'

interface PostPreviewProps {
  title: string
  content: string
  author: string
}

export default function PostPreview({ title, content, author }: PostPreviewProps) {
  const today = new Date().toLocaleDateString('ko-KR')

  return (
    <div className="h-full overflow-auto border border-border rounded-lg">
      <div className="px-3 py-1.5 border-b border-border bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <span className="text-xs font-medium text-muted">미리보기</span>
      </div>
      <div className="p-4">
        {title && (
          <h1 className="text-2xl font-bold mb-2 mt-0">{title}</h1>
        )}
        {(author || today) && (
          <div className="flex items-center gap-2 text-sm text-muted mb-6">
            {author && <span className="font-medium text-foreground">{author}</span>}
            {author && <span>·</span>}
            <time>{today}</time>
          </div>
        )}
        {content ? (
          <div className="prose-preview">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted text-sm">본문을 입력하면 여기에 미리보기가 표시됩니다.</p>
        )}
      </div>
    </div>
  )
}
