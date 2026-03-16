# Design: PR-Based Static Tech Blog System

> **Feature**: pr-based-blog-system
> **Plan Reference**: `docs/01-plan/features/pr-based-blog-system.plan.md`
> **Created**: 2026-03-16
> **Status**: Draft

---

## 1. Architecture Overview

The existing system uses Nextra 4's file-based routing with MDX content in `content/posts/`. This design adds **five incremental capabilities** on top of the existing architecture without changing the core content flow.

```
content/posts/*.mdx
       │
       ▼
   Nextra pageMap
       │
       ▼
  lib/get-posts.ts  ◄── [MODIFY] Add draft filtering, author normalization
       │
       ├── getPosts() → filters draft in production
       ├── Reading time computed per post
       │
       ▼
  ┌─────────────┐    ┌──────────────────┐
  │ app/page.tsx │    │ app/[...mdxPath]  │
  │ (list view)  │    │ (post view)       │
  └──────┬──────┘    └────────┬─────────┘
         │                     │
         ▼                     ▼
    PostCard.tsx          ArticleLayout.tsx
    [MODIFY: +readingTime]  [MODIFY: +readingTime]
```

**New files**:
```
lib/reading-time.ts                           ← utility
.github/PULL_REQUEST_TEMPLATE/blog-post.md    ← PR template
CONTRIBUTING.md                               ← contributor docs
```

---

## 2. Detailed Component Design

### 2.1 Type Updates — `types/post.ts`

**Current**:
```typescript
export type Category = '전체' | 'AI' | '인프라' | '보안' | '개발'
export const CATEGORIES: Category[] = ['전체', 'AI', '인프라', '보안', '개발']
```

**Modified**:
```typescript
export type Category = '전체' | 'AI' | '인프라' | '보안' | '개발'
export const CATEGORIES: Category[] = ['전체', 'AI', '인프라', '보안', '개발']

export interface PostFrontMatter {
  title?: string
  description?: string
  date?: string
  tags?: string[]
  author?: string          // NEW: singular author (alias)
  authors?: string[]       // existing
  reviewer?: string
  contributors?: string[]
  thumbnail?: string
  category?: Category
  draft?: boolean          // NEW: draft filtering
}
```

**Design decision**: Define `PostFrontMatter` as a shared interface to eliminate duplicate inline types in `PostCard.tsx`, `lib/get-posts.ts`, etc.

---

### 2.2 Reading Time Utility — `lib/reading-time.ts`

```typescript
const WORDS_PER_MINUTE = 200
const CODE_CHARS_PER_MINUTE = 100 // code reads slower, count by chars

export function calculateReadingTime(content: string): number {
  // Strip frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, '')

  // Separate code blocks from prose
  const codeBlocks: string[] = []
  const prose = withoutFrontmatter.replace(
    /```[\s\S]*?```/g,
    (match) => { codeBlocks.push(match); return '' }
  )

  // Count prose words
  const proseWords = prose
    .replace(/<[^>]+>/g, '')     // strip HTML/JSX tags
    .replace(/\{[^}]+\}/g, '')   // strip JSX expressions
    .replace(/[#*_~`>\[\]()!|-]/g, '') // strip markdown syntax
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0)
    .length

  // Count code characters
  const codeChars = codeBlocks.join('').length

  const proseMinutes = proseWords / WORDS_PER_MINUTE
  const codeMinutes = codeChars / CODE_CHARS_PER_MINUTE

  return Math.max(1, Math.ceil(proseMinutes + codeMinutes))
}
```

**Design decisions**:
- Separate WPM for prose (200) vs code (100 chars/min) for accuracy
- Minimum 1 minute (never show "0 min read")
- Strip frontmatter, HTML, JSX, and markdown syntax before counting
- No external dependencies

---

### 2.3 Data Layer Changes — `lib/get-posts.ts`

#### 2.3.1 Post Interface Update

```typescript
import type { PostFrontMatter } from '@/types/post'

export interface Post {
  route: string
  name: string
  title?: string
  frontMatter: PostFrontMatter
  readingTime?: number      // NEW: computed field
}
```

#### 2.3.2 Draft Filtering in `getPosts()`

Add filtering after the existing sort:

```typescript
export async function getPosts(): Promise<Post[]> {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts'
  })

  const isProduction = process.env.NODE_ENV === 'production'

  return directories
    .filter(post => post.name !== 'index')
    .filter(post => {
      // In production, exclude drafts. Missing draft field = published.
      if (isProduction) {
        return post.frontMatter?.draft !== true
      }
      return true
    })
    .sort((a, b) => {
      const dateA = a.frontMatter?.date ? new Date(a.frontMatter.date).getTime() : 0
      const dateB = b.frontMatter?.date ? new Date(b.frontMatter.date).getTime() : 0
      return dateB - dateA
    }) as Post[]
}
```

**Key behavior**: `draft: true` hides in production. Missing `draft` field or `draft: false` = published. All posts visible in development.

#### 2.3.3 Author Normalization

Not applied in `getPosts()` since Nextra passes raw frontmatter. Instead, normalize at the display layer:

```typescript
// Utility function for components
export function getAuthors(frontMatter: PostFrontMatter): string[] {
  if (frontMatter.authors && frontMatter.authors.length > 0) {
    return frontMatter.authors
  }
  if (frontMatter.author) {
    return [frontMatter.author]
  }
  return []
}
```

This preserves backward compatibility — existing posts using `authors: [...]` work unchanged. New posts can use either `author: "Name"` or `authors: ["Name"]`.

---

### 2.4 UI Changes — PostCard

**Location**: `components/PostCard.tsx`

**Change**: Add reading time display in the metadata line (after date, before tags).

```
authors | date | X min read | #tag1 #tag2
```

**Implementation approach**: Accept `readingTime` as an optional prop. The parent (`app/page.tsx`) won't have `sourceCode` available from the Nextra pageMap, so we need an alternative approach for the list view.

**Solution for list view reading time**: Since Nextra's `normalizePages` doesn't include source code, we have two options:

1. **Option A (Chosen)**: Read MDX files at build time in `getPosts()` using `fs.readFile` to get source content and compute reading time. This is acceptable because `getPosts()` already runs server-side.
2. **Option B**: Skip reading time in list view, only show in article view. Rejected — reading time in list view is expected UX.

Updated `getPosts()` with reading time:

```typescript
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { calculateReadingTime } from './reading-time'

export async function getPosts(): Promise<Post[]> {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts'
  })

  const isProduction = process.env.NODE_ENV === 'production'

  const posts = directories
    .filter(post => post.name !== 'index')
    .filter(post => {
      if (isProduction) {
        return post.frontMatter?.draft !== true
      }
      return true
    })
    .sort((a, b) => {
      const dateA = a.frontMatter?.date ? new Date(a.frontMatter.date).getTime() : 0
      const dateB = b.frontMatter?.date ? new Date(b.frontMatter.date).getTime() : 0
      return dateB - dateA
    }) as Post[]

  // Compute reading time for each post
  const postsWithReadingTime = await Promise.all(
    posts.map(async (post) => {
      try {
        const filePath = join(process.cwd(), 'content', 'posts', `${post.name}.mdx`)
        const content = await readFile(filePath, 'utf-8')
        return { ...post, readingTime: calculateReadingTime(content) }
      } catch {
        return { ...post, readingTime: undefined }
      }
    })
  )

  return postsWithReadingTime
}
```

**PostCard prop change**:

```typescript
interface PostCardProps {
  post: {
    route: string
    title?: string
    frontMatter?: PostFrontMatter
    readingTime?: number     // NEW
  }
}
```

**Display in PostCard** (add between date and tags in the metadata flex row):

```tsx
{readingTime && (
  <>
    <span className="text-border">|</span>
    <span>{readingTime} min read</span>
  </>
)}
```

---

### 2.5 UI Changes — ArticleLayout

**Location**: `components/ArticleLayout.tsx`

**Change**: Add reading time in the article header metadata line, next to date.

```tsx
interface ArticleLayoutProps {
  children: React.ReactNode
  toc?: TocItem[]
  metadata?: Record<string, unknown>
  sourceCode?: string      // Already passed by Nextra
}
```

In the component body:

```tsx
const sourceCode = props.sourceCode as string | undefined  // from Nextra wrapper
const readingTime = sourceCode ? calculateReadingTime(sourceCode) : undefined
```

Display after the date:

```tsx
{(authors || date) && (
  <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-6">
    {authors && authors.length > 0 && (
      <span className="font-medium text-foreground">{authors.join(', ')}</span>
    )}
    {authors && date && <span>·</span>}
    {date && (
      <time>{new Date(date).toLocaleDateString('ko-KR')}</time>
    )}
    {readingTime && (
      <>
        <span>·</span>
        <span>{readingTime} min read</span>
      </>
    )}
  </div>
)}
```

**Note**: `sourceCode` is already passed by the `[...mdxPath]/page.tsx` wrapper call. Verify in the existing code:

```tsx
// app/[...mdxPath]/page.tsx line 66
<Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
```

Confirmed — `sourceCode` is available. The `ArticleLayoutProps` interface just needs to accept it.

---

### 2.6 TEMPLATE.mdx Update

**Current frontmatter**:
```yaml
title: 글 제목을 입력하세요
description: 글에 대한 간단한 설명을 작성하세요
date: 2025-01-20
tags:
  - Tag1
  - Tag2
authors:
  - silano08
```

**Updated frontmatter**:
```yaml
title: 글 제목을 입력하세요
description: 글에 대한 간단한 설명을 작성하세요 (검색 결과 및 카드에 표시됩니다)
date: 2025-01-20
tags:
  - Tag1
  - Tag2
author: your-github-id
authors:
  - your-github-id
category: 개발
draft: true
```

**Notes**:
- Added `draft: true` so new posts start as drafts by default
- Added `author` field alongside `authors` to demonstrate both formats
- Added `category` field with example
- Existing "작성 가이드" section at bottom stays

---

### 2.7 PR Template — `.github/PULL_REQUEST_TEMPLATE/blog-post.md`

```markdown
## Blog Post Submission

### Post Information
- **File**: `content/posts/your-post-name.mdx`
- **Title**: <!-- post title -->
- **Author**: <!-- your name/GitHub ID -->

### Checklist

- [ ] File is in `content/posts/` directory
- [ ] Filename is lowercase with hyphens (e.g., `my-post-title.mdx`)
- [ ] Frontmatter includes all required fields:
  - [ ] `title`
  - [ ] `description`
  - [ ] `date` (YYYY-MM-DD format)
  - [ ] `tags` (array)
  - [ ] `authors` or `author`
  - [ ] `category` (AI | 인프라 | 보안 | 개발)
  - [ ] `draft: false` (set to false when ready to publish)
- [ ] No broken images (images in `public/images/`)
- [ ] Code blocks have language specified (```typescript, ```java, etc.)
- [ ] Previewed locally with `pnpm dev`

### Preview
<!-- Paste a screenshot of local preview if possible -->
```

---

### 2.8 CONTRIBUTING.md

Structure and key sections:

```markdown
# 기술 블로그 기여 가이드

## 빠른 시작
1. 리포지토리 클론
2. `pnpm install`
3. `content/posts/` 에 MDX 파일 생성
4. `pnpm dev` 로 미리보기
5. PR 생성

## 글 작성 방법

### 파일 생성
- 위치: `content/posts/your-post-name.mdx`
- 파일명: 영문 소문자 + 하이픈 (URL slug가 됨)

### Frontmatter 필수 항목
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | ✅ | 글 제목 |
| description | string | ✅ | 요약 (카드, 검색, SEO) |
| date | string | ✅ | YYYY-MM-DD |
| tags | string[] | ✅ | 태그 배열 |
| author / authors | string / string[] | ✅ | 작성자 |
| category | string | ✅ | AI, 인프라, 보안, 개발 중 하나 |
| draft | boolean | ❌ | true면 프로덕션에서 숨김 |
| thumbnail | string | ❌ | 썸네일 이미지 경로 |
| reviewer | string | ❌ | 검수자 |
| contributors | string[] | ❌ | 기여자 목록 |

### 콘텐츠 작성
- 마크다운 + MDX 지원
- 코드 블록: 언어 명시 필수 (구문 강조)
- 이미지: `public/images/` 에 저장 후 `/images/파일명` 으로 참조

### 로컬 미리보기
pnpm dev → http://localhost:3000
draft: true 글도 로컬에서는 보임

## PR 제출
1. feature branch 생성
2. 글 작성 및 로컬 확인
3. `draft: false` 설정
4. PR 생성 (blog-post 템플릿 사용)
5. 리뷰 후 머지 → 자동 배포
```

---

## 3. Implementation Order

| Step | File | Action | Dependencies |
|------|------|--------|--------------|
| 1 | `types/post.ts` | Add `PostFrontMatter` interface with `draft`, `author` | None |
| 2 | `lib/reading-time.ts` | Create reading time utility | None |
| 3 | `lib/get-posts.ts` | Add draft filtering, reading time computation, `getAuthors()` | Steps 1, 2 |
| 4 | `components/PostCard.tsx` | Add `readingTime` display | Step 3 |
| 5 | `components/ArticleLayout.tsx` | Add `readingTime` from `sourceCode` prop | Step 2 |
| 6 | `TEMPLATE.mdx` | Add `draft`, `author`, `category` fields | None |
| 7 | `.github/PULL_REQUEST_TEMPLATE/blog-post.md` | Create PR template | None |
| 8 | `CONTRIBUTING.md` | Create contributor documentation | Steps 1-6 |

Steps 1-2 can run in parallel. Steps 6-7 can run in parallel with steps 3-5.

---

## 4. Testing Strategy

| Test | Method | Expected Result |
|------|--------|-----------------|
| Draft filtering (prod) | `NODE_ENV=production pnpm build` with a `draft: true` post | Post not in output |
| Draft filtering (dev) | `pnpm dev` with a `draft: true` post | Post visible |
| Draft field missing | Existing post without `draft` field | Post visible (published) |
| Reading time | Post with ~400 words prose | Shows "2 min read" |
| Reading time (code-heavy) | Post with 200 words + large code block | Shows reasonable estimate |
| Author normalization | Post with `author: "Name"` | Displays correctly |
| Author normalization | Post with `authors: ["A", "B"]` | Displays correctly |
| PR template | Create PR on GitHub | Template auto-populated |
| Tag page | Navigate to `/tags/[tag]` | Draft posts excluded in production |
| Search | Search for draft post title | Not found in production |

---

## 5. Rollback Plan

All changes are additive:
- **Draft filtering**: Remove the `.filter()` call in `getPosts()` to revert
- **Reading time**: Remove the `readingTime` prop from PostCard/ArticleLayout to hide
- **Type changes**: `PostFrontMatter` fields are all optional, backward-compatible
- **PR template / CONTRIBUTING.md**: Delete files to revert

No database, no API, no infrastructure changes — rollback is a simple git revert.

---

## 6. Files Summary

### Modified (5 files)
| File | Changes |
|------|---------|
| `types/post.ts` | Add `PostFrontMatter` interface |
| `lib/get-posts.ts` | Draft filter, reading time, `getAuthors()` |
| `components/PostCard.tsx` | Display `readingTime` in metadata |
| `components/ArticleLayout.tsx` | Compute and display `readingTime` from `sourceCode` |
| `TEMPLATE.mdx` | Add `draft`, `author`, `category` to frontmatter |

### Created (3 files)
| File | Purpose |
|------|---------|
| `lib/reading-time.ts` | Reading time calculation utility |
| `.github/PULL_REQUEST_TEMPLATE/blog-post.md` | Blog post PR template |
| `CONTRIBUTING.md` | Contributor documentation |
