# Design: GitHub Web Editor

> **Feature**: github-web-editor
> **Plan Reference**: `docs/01-plan/features/github-web-editor.plan.md`
> **Created**: 2026-03-16
> **Status**: Draft

---

## 1. 시스템 구조

```
브라우저 (클라이언트)
    │
    ├─ /write ──────────────────── 글쓰기 페이지 (로그인 필요)
    │    ├─ FrontmatterForm        frontmatter 입력 폼
    │    ├─ MarkdownEditor         마크다운 에디터 (textarea)
    │    └─ PostPreview            실시간 미리보기
    │
    ├─ /api/auth/github ────────── OAuth 시작 (리다이렉트)
    ├─ /api/auth/github/callback ─ 토큰 교환 (서버사이드)
    ├─ /api/auth/me ────────────── 로그인 상태 확인
    ├─ /api/auth/logout ────────── 로그아웃
    └─ /api/posts/submit ───────── PR 생성 API
           │
           └─ GitHub REST API
                ├─ GET  git/ref (최신 SHA)
                ├─ POST git/refs (브랜치 생성)
                ├─ PUT  contents/ (파일 커밋)
                └─ POST pulls (PR 생성)
```

---

## 2. 환경변수 설계

### `.env.example`

```env
# GitHub OAuth App
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# 대상 리포지토리
GITHUB_OWNER=Hecto-Financial
GITHUB_REPO=hecto-tech
GITHUB_DEFAULT_BRANCH=main

# 사이트 URL (OAuth callback에 사용)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `.env` (gitignore에 추가)

실제 값은 `.env`에 입력. `.env.example`은 커밋해서 팀원들이 어떤 값이 필요한지 알 수 있게 함.

**NEXT_PUBLIC_ 접두사 규칙**:
- `GITHUB_CLIENT_ID` → 서버 전용 (Route Handler에서만 사용)
- `GITHUB_CLIENT_SECRET` → 서버 전용 (절대 프론트 노출 금지)
- `NEXT_PUBLIC_SITE_URL` → 클라이언트에서도 사용 (이미 존재)

---

## 3. API Route 상세 설계

### 3.1 `app/api/auth/github/route.ts` — OAuth 시작

```typescript
// GET /api/auth/github
// → GitHub 인증 페이지로 리다이렉트

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/github/callback`,
    scope: 'repo',  // repo 접근 권한 (PR 생성에 필요)
    state: crypto.randomUUID(),  // CSRF 방지
  })

  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`)
}
```

**scope 설명**: `repo` — private repo에 파일 커밋 + PR 생성 가능. public repo만이면 `public_repo`로 축소 가능.

### 3.2 `app/api/auth/github/callback/route.ts` — 토큰 교환

```typescript
// GET /api/auth/github/callback?code=xxx&state=xxx
// → code를 access_token으로 교환 → httpOnly 쿠키에 저장 → /write로 리다이렉트

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}?error=no_code`)
  }

  // GitHub에 access_token 요청
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const { access_token, error } = await tokenResponse.json()

  if (error || !access_token) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}?error=auth_failed`)
  }

  // httpOnly 쿠키에 토큰 저장
  const response = Response.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/write`)
  response.headers.set('Set-Cookie',
    `gh_token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    // 24시간 유효, HttpOnly로 JS에서 접근 불가
  )

  return response
}
```

**보안 포인트**:
- `HttpOnly` → XSS로 토큰 탈취 불가
- `SameSite=Lax` → CSRF 방지
- `Max-Age=86400` → 24시간 후 자동 만료
- Production에서는 `Secure` 플래그 추가 필요

### 3.3 `app/api/auth/me/route.ts` — 사용자 정보

```typescript
// GET /api/auth/me
// → 현재 로그인된 GitHub 사용자 정보 반환

import { getTokenFromCookie } from '@/lib/auth'

export async function GET(request: Request) {
  const token = getTokenFromCookie(request)

  if (!token) {
    return Response.json({ user: null }, { status: 401 })
  }

  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    return Response.json({ user: null }, { status: 401 })
  }

  const user = await res.json()
  return Response.json({
    user: {
      login: user.login,       // GitHub ID
      name: user.name,         // 표시 이름
      avatar_url: user.avatar_url,
    }
  })
}
```

### 3.4 `app/api/auth/logout/route.ts` — 로그아웃

```typescript
// POST /api/auth/logout
// → 쿠키 삭제 → 홈으로 리다이렉트

export async function POST() {
  const response = Response.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}`)
  response.headers.set('Set-Cookie',
    'gh_token=; Path=/; HttpOnly; Max-Age=0'
  )
  return response
}
```

### 3.5 `app/api/posts/submit/route.ts` — PR 생성

```typescript
// POST /api/posts/submit
// Body: { title, description, content, tags, category, author }
// → 브랜치 생성 → 파일 커밋 → PR 생성 → PR URL 반환

import { getTokenFromCookie } from '@/lib/auth'
import { createBranch, commitFile, createPullRequest, getDefaultBranchSha } from '@/lib/github'

interface SubmitBody {
  title: string
  description: string
  content: string      // 마크다운 본문
  tags: string[]
  category: string
  author: string
}

export async function POST(request: Request) {
  const token = getTokenFromCookie(request)
  if (!token) {
    return Response.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const body: SubmitBody = await request.json()

  // 1. slug 생성
  const slug = generateSlug(body.title)
  const branchName = `post/${slug}-${Date.now()}`
  const filePath = `content/posts/${slug}.mdx`

  // 2. frontmatter + 본문 조합
  const fileContent = buildMdxContent(body)

  // 3. GitHub API 호출
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const defaultBranch = process.env.GITHUB_DEFAULT_BRANCH || 'main'

  const sha = await getDefaultBranchSha(token, owner, repo, defaultBranch)
  await createBranch(token, owner, repo, branchName, sha)
  await commitFile(token, owner, repo, branchName, filePath, fileContent, `post: ${body.title}`)
  const pr = await createPullRequest(token, owner, repo, {
    title: `[Blog] ${body.title}`,
    body: buildPrBody(body),
    head: branchName,
    base: defaultBranch,
  })

  return Response.json({ url: pr.html_url })
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[가-힣]/g, (ch) => ch)  // 한글 유지
    .replace(/[^\w가-힣\s-]/g, '')     // 특수문자 제거
    .replace(/\s+/g, '-')              // 공백 → 하이픈
    .replace(/-+/g, '-')               // 중복 하이픈 제거
    .trim()
}

function buildMdxContent(body: SubmitBody): string {
  const today = new Date().toISOString().split('T')[0]
  return `---
title: "${body.title}"
description: "${body.description}"
date: "${today}"
tags:
${body.tags.map(t => `  - ${t}`).join('\n')}
author: ${body.author}
authors:
  - ${body.author}
category: ${body.category}
draft: false
---

${body.content}
`
}

function buildPrBody(body: SubmitBody): string {
  return `## Blog Post Submission

### Post Information
- **Title**: ${body.title}
- **Author**: ${body.author}
- **Category**: ${body.category}
- **Tags**: ${body.tags.join(', ')}

### Description
${body.description}

---
*이 PR은 웹 에디터에서 자동 생성되었습니다.*`
}
```

---

## 4. 유틸리티 라이브러리 설계

### 4.1 `lib/auth.ts`

```typescript
import { cookies } from 'next/headers'

const COOKIE_NAME = 'gh_token'

// Route Handler에서 사용 (Request 객체에서 쿠키 추출)
export function getTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

// Server Component에서 사용
export async function getTokenFromServerCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}
```

### 4.2 `lib/github.ts`

```typescript
const GITHUB_API = 'https://api.github.com'

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

// 기본 브랜치 최신 커밋 SHA
export async function getDefaultBranchSha(
  token: string, owner: string, repo: string, branch: string
): Promise<string> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    { headers: headers(token) }
  )
  if (!res.ok) throw new Error(`Failed to get branch SHA: ${res.status}`)
  const data = await res.json()
  return data.object.sha
}

// 새 브랜치 생성
export async function createBranch(
  token: string, owner: string, repo: string,
  branchName: string, sha: string
): Promise<void> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha }),
    }
  )
  if (!res.ok) throw new Error(`Failed to create branch: ${res.status}`)
}

// 파일 커밋
export async function commitFile(
  token: string, owner: string, repo: string,
  branch: string, path: string, content: string, message: string
): Promise<void> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
      }),
    }
  )
  if (!res.ok) throw new Error(`Failed to commit file: ${res.status}`)
}

// PR 생성
export async function createPullRequest(
  token: string, owner: string, repo: string,
  params: { title: string; body: string; head: string; base: string }
): Promise<{ html_url: string }> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(params),
    }
  )
  if (!res.ok) throw new Error(`Failed to create PR: ${res.status}`)
  return res.json()
}
```

---

## 5. 프론트엔드 컴포넌트 설계

### 5.1 `components/editor/WriteButton.tsx`

Navbar에 들어갈 "글쓰기" 버튼. 로그인 상태에 따라 다르게 동작.

```typescript
'use client'

// 로그인 안 됨 → /api/auth/github 로 리다이렉트 (OAuth 시작)
// 로그인 됨 → /write 로 이동

interface WriteButtonProps {
  isLoggedIn: boolean
}
```

**UI**: 작은 버튼, primary 색상, Navbar 우측에 배치.

### 5.2 `components/editor/FrontmatterForm.tsx`

```typescript
'use client'

interface FrontmatterData {
  title: string
  description: string
  tags: string[]       // 태그 입력 (쉼표 구분 → 배열)
  category: Category   // select 드롭다운
}

// - title: text input
// - description: text input
// - tags: text input (쉼표 구분, 입력 시 태그 칩으로 표시)
// - category: select (AI | 인프라 | 보안 | 개발)
```

**UI 스타일**: 기존 블로그 디자인 (primary: #ff6114, Noto Sans KR)에 맞춤. 심플한 폼.

### 5.3 `components/editor/MarkdownEditor.tsx`

```typescript
'use client'

// 심플한 textarea 기반 에디터
// - monospace 폰트 (JetBrains Mono)
// - 탭 키 지원 (들여쓰기)
// - 최소 높이 400px, 리사이즈 가능
// - 글자 수 표시

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}
```

### 5.4 `components/editor/PostPreview.tsx`

```typescript
'use client'

// 마크다운 → HTML 실시간 렌더링
// 기존 블로그 글 스타일과 동일하게 보이도록 globals.css의 base 스타일 적용

interface PostPreviewProps {
  title: string
  content: string      // raw markdown
  author: string
}
```

**미리보기 구현**: `react-markdown` 사용. 코드 블록 구문 강조는 미리보기에서는 생략 (실제 게시물에서 Shiki가 처리).

### 5.5 `app/write/page.tsx` — 글쓰기 페이지

```
┌──────────────────────────────────────────────────────────┐
│  ← 돌아가기              글쓰기              [PR 제출]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  제목: [________________________]                        │
│  설명: [________________________]                        │
│  카테고리: [개발 ▼]    태그: [Spring] [MSA] [+추가]     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [에디터]                    │  [미리보기]                │
│                              │                           │
│  # 제목                      │  제목 (렌더링)            │
│                              │                           │
│  본문을 작성하세요...        │  본문 (렌더링)            │
│                              │                           │
│                              │                           │
│                              │                           │
└──────────────────────────────────────────────────────────┘
```

**레이아웃**:
- 상단: frontmatter 폼
- 하단: 2분할 (좌: 에디터, 우: 미리보기)
- 모바일: 탭 전환 (에디터 / 미리보기)

**페이지 접근 제어**:
- 서버 컴포넌트에서 `getTokenFromServerCookies()` 체크
- 미로그인 → `/api/auth/github` 로 리다이렉트

---

## 6. 구현 순서

| Step | 파일 | 작업 | 의존성 |
|------|------|------|--------|
| 1 | `.env.example` | 환경변수 예시 파일 생성 | 없음 |
| 2 | `lib/auth.ts` | 쿠키 기반 토큰 관리 유틸 | 없음 |
| 3 | `lib/github.ts` | GitHub API 헬퍼 (SHA, 브랜치, 커밋, PR) | 없음 |
| 4 | `app/api/auth/github/route.ts` | OAuth 시작 리다이렉트 | Step 1 |
| 5 | `app/api/auth/github/callback/route.ts` | 토큰 교환 + 쿠키 저장 | Step 1 |
| 6 | `app/api/auth/me/route.ts` | 사용자 정보 조회 | Step 2 |
| 7 | `app/api/auth/logout/route.ts` | 로그아웃 | 없음 |
| 8 | `app/api/posts/submit/route.ts` | PR 생성 API | Steps 2, 3 |
| 9 | `components/editor/FrontmatterForm.tsx` | frontmatter 입력 폼 | 없음 |
| 10 | `components/editor/MarkdownEditor.tsx` | 마크다운 에디터 | 없음 |
| 11 | `components/editor/PostPreview.tsx` | 미리보기 | 없음 |
| 12 | `app/write/page.tsx` | 글쓰기 페이지 조립 | Steps 6, 9-11 |
| 13 | `components/editor/WriteButton.tsx` | 글쓰기 버튼 | Step 6 |
| 14 | `components/Navbar.tsx` 수정 | WriteButton 추가 | Step 13 |

**병렬 가능**: Steps 1-3 동시, Steps 4-7 동시, Steps 9-11 동시.

---

## 7. 패키지

| 패키지 | 용도 | 설치 명령 |
|--------|------|-----------|
| `react-markdown` | 미리보기 마크다운 렌더링 | `pnpm add react-markdown` |

1개만 추가. 나머지는 모두 Next.js 내장 기능으로 처리.

---

## 8. 보안 체크리스트

| 항목 | 구현 방식 |
|------|-----------|
| `client_secret` 서버 전용 | Route Handler에서만 사용, `NEXT_PUBLIC_` 접두사 안 붙임 |
| 토큰 저장 | httpOnly 쿠키 (JS 접근 불가) |
| CSRF 방지 | OAuth state 파라미터 + SameSite=Lax |
| XSS 방지 | 미리보기에서 `react-markdown` 사용 (dangerouslySetInnerHTML 안 씀) |
| 입력 검증 | submit API에서 필수 필드 확인 |
| 토큰 만료 | 쿠키 Max-Age 24시간 |

---

## 9. 테스트 방법

| 테스트 | 방법 | 예상 결과 |
|--------|------|-----------|
| OAuth 로그인 | "글쓰기" 클릭 → GitHub 로그인 | /write로 리다이렉트, 쿠키에 토큰 저장 |
| 사용자 정보 | /api/auth/me 호출 | GitHub 프로필 반환 |
| 로그아웃 | 로그아웃 버튼 클릭 | 쿠키 삭제, 홈으로 이동 |
| 에디터 | 마크다운 입력 | 우측에 실시간 렌더링 |
| PR 제출 | 글 작성 → "PR 제출" | GitHub에 브랜치 + 파일 + PR 생성 |
| 미로그인 접근 | 직접 /write 접속 | OAuth 로그인으로 리다이렉트 |
| env 미설정 | GITHUB_CLIENT_ID 비어있을 때 | 에러 메시지 표시 |

---

## 10. 파일 요약

### 생성 (13개)
| 파일 | 목적 |
|------|------|
| `.env.example` | 환경변수 예시 |
| `lib/auth.ts` | 토큰/쿠키 관리 |
| `lib/github.ts` | GitHub API 헬퍼 |
| `app/api/auth/github/route.ts` | OAuth 시작 |
| `app/api/auth/github/callback/route.ts` | 토큰 교환 |
| `app/api/auth/me/route.ts` | 사용자 정보 |
| `app/api/auth/logout/route.ts` | 로그아웃 |
| `app/api/posts/submit/route.ts` | PR 생성 |
| `components/editor/FrontmatterForm.tsx` | frontmatter 폼 |
| `components/editor/MarkdownEditor.tsx` | 마크다운 에디터 |
| `components/editor/PostPreview.tsx` | 미리보기 |
| `components/editor/WriteButton.tsx` | 글쓰기 버튼 |
| `app/write/page.tsx` | 글쓰기 페이지 |

### 수정 (2개)
| 파일 | 변경 |
|------|------|
| `components/Navbar.tsx` | WriteButton 추가 |
| `.gitignore` | `.env` 추가 확인 |
