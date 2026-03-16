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

export async function POST(request: Request) {
  const token = getTokenFromCookie(request)
  if (!token) {
    return Response.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const body: SubmitBody = await request.json()

  if (!body.title || !body.content) {
    return Response.json({ error: '제목과 본문은 필수입니다' }, { status: 400 })
  }

  const slug = generateSlug(body.title)
  const branchName = `post/${slug}-${Date.now()}`
  const filePath = `content/posts/${slug}.mdx`
  const fileContent = buildMdxContent(body)

  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const defaultBranch = process.env.GITHUB_DEFAULT_BRANCH || 'main'

  try {
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PR 생성에 실패했습니다'
    return Response.json({ error: message }, { status: 500 })
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
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
