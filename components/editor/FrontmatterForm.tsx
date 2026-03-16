'use client'

import { useState } from 'react'
import type { Category } from '@/types/post'

const CATEGORIES: Exclude<Category, '전체'>[] = ['AI', '인프라', '보안', '개발']

export interface FrontmatterData {
  title: string
  description: string
  tags: string[]
  category: string
}

interface FrontmatterFormProps {
  value: FrontmatterData
  onChange: (data: FrontmatterData) => void
}

export default function FrontmatterForm({ value, onChange }: FrontmatterFormProps) {
  const [tagInput, setTagInput] = useState('')

  const update = (field: keyof FrontmatterData, val: string | string[]) => {
    onChange({ ...value, [field]: val })
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !value.tags.includes(tag)) {
      update('tags', [...value.tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    update('tags', value.tags.filter(t => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return  // 한글 IME 조합 중이면 무시
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
          제목
        </label>
        <input
          id="title"
          type="text"
          value={value.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="글 제목을 입력하세요"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          설명
        </label>
        <input
          id="description"
          type="text"
          value={value.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="글에 대한 간단한 설명 (검색 결과, 카드에 표시)"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-48">
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
            카테고리
          </label>
          <select
            id="category"
            value={value.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-1">
            태그
          </label>
          <div className="flex flex-wrap gap-2 items-center p-2 border border-border rounded-lg bg-background min-h-[42px]">
            {value.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-primary/60 hover:text-primary"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder={value.tags.length === 0 ? '태그 입력 후 Enter' : ''}
              className="flex-1 min-w-[100px] bg-transparent text-foreground focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
