'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FrontmatterForm from '@/components/editor/FrontmatterForm'
import type { FrontmatterData } from '@/components/editor/FrontmatterForm'
import MarkdownEditor from '@/components/editor/MarkdownEditor'
import PostPreview from '@/components/editor/PostPreview'

interface User {
  login: string
  name: string | null
  avatar_url: string
}

interface WriteEditorProps {
  user: User
}

export default function WriteEditor({ user }: WriteEditorProps) {
  const [frontmatter, setFrontmatter] = useState<FrontmatterData>({
    title: '',
    description: '',
    tags: [],
    category: '개발',
  })
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  const canSubmit = frontmatter.title.trim() && content.trim() && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/posts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: frontmatter.title,
          description: frontmatter.description,
          content,
          tags: frontmatter.tags,
          category: frontmatter.category,
          author: user.login,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({ error: data.error || 'PR 생성에 실패했습니다' })
      } else {
        setResult({ url: data.url })
      }
    } catch {
      setResult({ error: '네트워크 오류가 발생했습니다' })
    } finally {
      setSubmitting(false)
    }
  }

  if (result?.url) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">PR이 생성되었습니다!</h1>
        <p className="text-muted mb-6">리뷰 후 머지되면 블로그에 게시됩니다.</p>
        <div className="flex gap-3 justify-center">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
          >
            PR 확인하기
          </a>
          <Link href="/" className="px-4 py-2 border border-border rounded-lg text-foreground">
            홈으로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted hover:text-foreground">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">글쓰기</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:block">{user.login}</span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '제출 중...' : 'PR 제출'}
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {result?.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {result.error}
        </div>
      )}

      {/* Frontmatter 폼 */}
      <FrontmatterForm value={frontmatter} onChange={setFrontmatter} />

      {/* 모바일 탭 */}
      <div className="flex gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'editor'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-muted'
          }`}
        >
          에디터
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg ${
            activeTab === 'preview'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-muted'
          }`}
        >
          미리보기
        </button>
      </div>

      {/* 에디터 + 미리보기 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[500px]">
        <div className={activeTab === 'preview' ? 'hidden sm:block' : ''}>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
        <div className={activeTab === 'editor' ? 'hidden sm:block' : ''}>
          <PostPreview
            title={frontmatter.title}
            content={content}
            author={user.login}
          />
        </div>
      </div>
    </div>
  )
}
