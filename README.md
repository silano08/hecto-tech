# Hecto Financial Tech Blog

헥토파이낸셜 개발팀의 기술 블로그입니다.

## Tech Stack

- **Framework**: Next.js 16 + Nextra 4
- **Styling**: Tailwind CSS 4
- **Content**: MDX (file-based)
- **Comments**: Giscus (GitHub Discussions)
- **Package Manager**: pnpm

## Getting Started

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 필요한 값 입력

# 개발 서버 실행
pnpm dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## Project Structure

```
app/
  page.tsx                     # 홈 (글 목록)
  [..mdxPath]/page.tsx         # 글 상세 페이지
  tags/[tag]/page.tsx          # 태그별 글 목록
  write/page.tsx               # 웹 에디터 (글쓰기)
  api/
    auth/github/               # GitHub OAuth 인증
    posts/submit/              # PR 자동 생성 API

content/
  posts/*.mdx                  # 블로그 글 (MDX)

components/
  ArticleLayout.tsx            # 글 상세 레이아웃
  PostCard.tsx                 # 글 카드 (목록)
  Navbar.tsx                   # 네비게이션 바
  editor/                      # 웹 에디터 컴포넌트

lib/
  get-posts.ts                 # 글 조회 유틸
  reading-time.ts              # 읽기 시간 추정
  auth.ts                      # OAuth 토큰 관리
  github.ts                    # GitHub API 헬퍼
```

## Writing a Post

### Option 1: 웹 에디터

블로그 사이트에서 **글쓰기** 버튼 클릭 → GitHub 로그인 → 마크다운 에디터에서 작성 → PR 자동 생성

### Option 2: 직접 작성

1. `content/posts/` 에 `.mdx` 파일 생성
2. frontmatter 작성
3. PR 제출

### Frontmatter

```yaml
---
title: "글 제목"
description: "글 설명"
date: "2026-03-16"
tags:
  - Tag1
  - Tag2
author: github-id
authors:
  - github-id
category: 개발        # AI | 인프라 | 보안 | 개발
draft: false          # true면 프로덕션에서 숨김
---
```

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md) 참고.

## Environment Variables

`.env.example`을 참고하여 `.env` 파일을 생성하세요.

| 변수 | 설명 | 필수 |
|------|------|:----:|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | 웹 에디터 사용 시 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | 웹 에디터 사용 시 |
| `GITHUB_OWNER` | 대상 리포지토리 소유자 | 웹 에디터 사용 시 |
| `GITHUB_REPO` | 대상 리포지토리 이름 | 웹 에디터 사용 시 |
| `GITHUB_DEFAULT_BRANCH` | 기본 브랜치 (기본: main) | - |
| `ALLOWED_BLOG_AUTHORS` | 허용된 작성자 목록 (쉼표 구분) | - |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL | - |
| `NEXT_PUBLIC_GISCUS_REPO` | Giscus 리포지토리 | 댓글 사용 시 |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | Giscus 리포지토리 ID | 댓글 사용 시 |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | Giscus 카테고리 ID | 댓글 사용 시 |

## Commands

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm lint         # 린트
pnpm format       # 포맷팅
```
