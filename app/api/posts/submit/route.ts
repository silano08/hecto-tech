import { getTokenFromCookie } from '@/lib/auth'
import { createBranch, commitFile, createPullRequest, getDefaultBranchSha } from '@/lib/github'

interface SubmitBody {
  title: string
  description: string
  content: string
  tags: string[]
  category: string
  author: string
}

const ALLOWED_CATEGORIES = ['AI', '인프라', '보안', '개발']
const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 500
const MAX_CONTENT_LENGTH = 100_000 // 100KB
const MAX_TAGS = 20
const MAX_TAG_LENGTH = 50

// 허용된 사용자 목록 (환경변수에서 관리)
function getAllowedUsers(): string[] | null {
  const users = process.env.ALLOWED_BLOG_AUTHORS
  if (!users) return null // 미설정 시 제한 없음
  return users.split(',').map(u => u.trim().toLowerCase())
}

export async function POST(request: Request) {
  const token = getTokenFromCookie(request)
  if (!token) {
    return Response.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  // 사용자 정보 확인 + 권한 체크
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!userRes.ok) {
    return Response.json({ error: '인증이 만료되었습니다' }, { status: 401 })
  }
  const githubUser = await userRes.json()

  const allowedUsers = getAllowedUsers()
  if (allowedUsers && !allowedUsers.includes(githubUser.login.toLowerCase())) {
    return Response.json({ error: '글 작성 권한이 없습니다' }, { status: 403 })
  }

  const body: SubmitBody = await request.json()

  // 입력 검증
  const validationError = validateInput(body)
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 })
  }

  const slug = generateSlug(body.title)

  // path traversal 방지
  if (!slug || slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    return Response.json({ error: '유효하지 않은 제목입니다' }, { status: 400 })
  }

  const branchName = `post/${slug}-${Date.now()}`
  const filePath = `content/posts/${slug}.mdx`
  const fileContent = buildMdxContent(body, githubUser.login)

  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const defaultBranch = process.env.GITHUB_DEFAULT_BRANCH || 'main'

  try {
    const sha = await getDefaultBranchSha(token, owner, repo, defaultBranch)
    await createBranch(token, owner, repo, branchName, sha)
    await commitFile(token, owner, repo, branchName, filePath, fileContent, `post: ${sanitize(body.title)}`)
    const pr = await createPullRequest(token, owner, repo, {
      title: `[Blog] ${sanitize(body.title)}`,
      body: buildPrBody(body, githubUser.login),
      head: branchName,
      base: defaultBranch,
    })

    return Response.json({ url: pr.html_url })
  } catch {
    return Response.json({ error: 'PR 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 })
  }
}

function validateInput(body: SubmitBody): string | null {
  if (!body.title?.trim()) return '제목은 필수입니다'
  if (!body.content?.trim()) return '본문은 필수입니다'
  if (body.title.length > MAX_TITLE_LENGTH) return `제목은 ${MAX_TITLE_LENGTH}자 이하여야 합니다`
  if (body.description && body.description.length > MAX_DESCRIPTION_LENGTH) return `설명은 ${MAX_DESCRIPTION_LENGTH}자 이하여야 합니다`
  if (body.content.length > MAX_CONTENT_LENGTH) return '본문이 너무 깁니다'
  if (body.tags && body.tags.length > MAX_TAGS) return `태그는 ${MAX_TAGS}개 이하여야 합니다`
  if (body.tags?.some(t => t.length > MAX_TAG_LENGTH)) return `태그는 각 ${MAX_TAG_LENGTH}자 이하여야 합니다`
  if (body.category && !ALLOWED_CATEGORIES.includes(body.category)) return '유효하지 않은 카테고리입니다'
  return null
}

// YAML 특수문자 이스케이프
function sanitize(str: string): string {
  return str.replace(/[\\"]/g, '\\$&').replace(/\n/g, ' ')
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildMdxContent(body: SubmitBody, login: string): string {
  const today = new Date().toISOString().split('T')[0]
  const title = sanitize(body.title)
  const description = sanitize(body.description || '')
  const tags = body.tags
    .map(t => t.replace(/[:"{}[\]]/g, '').trim())
    .filter(t => t.length > 0)
  // MDX import/export 구문 제거
  const content = body.content
    .replace(/^import\s+.+$/gm, '')
    .replace(/^export\s+.+$/gm, '')

  return `---
title: "${title}"
description: "${description}"
date: "${today}"
tags:
${tags.map(t => `  - ${t}`).join('\n')}
author: ${login}
authors:
  - ${login}
category: ${body.category}
draft: false
---

${content}
`
}

function buildPrBody(body: SubmitBody, login: string): string {
  return `## Blog Post Submission

### Post Information
- **Title**: ${sanitize(body.title)}
- **Author**: ${login}
- **Category**: ${body.category}
- **Tags**: ${body.tags.join(', ')}

### Description
${sanitize(body.description || '')}

---
*이 PR은 웹 에디터에서 자동 생성되었습니다.*`
}
