# Plan: GitHub Web Editor (웹에서 블로그 글 작성 → PR 자동 생성)

> **Feature**: github-web-editor
> **Created**: 2026-03-16
> **Status**: Draft
> **Priority**: High

---

## 1. 배경 및 문제

현재 블로그 글 작성 프로세스:
1. 로컬에서 리포지토리 클론
2. MDX 파일 직접 작성
3. git push → PR 생성

**문제점**: 개발자라도 매번 로컬 환경에서 글을 써야 하는 게 번거로움. 특히 간단한 글이나 수정은 웹에서 바로 할 수 있으면 훨씬 편함.

**목표**: 블로그 사이트 내에서 GitHub 로그인 후, 마크다운 에디터로 글을 작성하고 "제출" 버튼을 누르면 자동으로 PR이 생성되는 기능.

---

## 2. 사용자 흐름

```
[블로그 사이트] "글쓰기" 버튼 클릭
       ↓
GitHub OAuth 로그인 (팝업/리다이렉트)
       ↓
마크다운 에디터 페이지 (frontmatter 폼 + 본문 에디터)
       ↓
실시간 미리보기로 확인
       ↓
"PR 제출" 클릭
       ↓
GitHub API 자동 처리:
  1. 새 브랜치 생성 (post/제목-slug)
  2. content/posts/slug.mdx 파일 커밋
  3. PR 생성 (blog-post 템플릿 적용)
       ↓
"PR이 생성되었습니다" + PR 링크 표시
```

---

## 3. 기술 아키텍처

### 3.1 GitHub OAuth 인증

```
브라우저 → GitHub OAuth 로그인 페이지 리다이렉트
       ↓
사용자 승인 → callback URL로 code 반환
       ↓
Next.js Route Handler (app/api/auth/github/callback)
  → code + client_secret으로 access_token 교환 (서버사이드)
       ↓
access_token을 httpOnly 쿠키에 저장
       ↓
이후 GitHub API 호출 시 쿠키에서 토큰 사용
```

**왜 Route Handler가 필요한가**: `client_secret`은 프론트에 노출하면 안 됨. Next.js Route Handler는 서버에서 실행되므로 안전.

### 3.2 환경변수

모든 민감 정보는 `.env`로 분리:

```env
# GitHub OAuth App 설정
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback

# 대상 리포지토리 (나중에 변경 가능)
GITHUB_OWNER=Hecto-Financial
GITHUB_REPO=hecto-tech
GITHUB_DEFAULT_BRANCH=main
```

### 3.3 GitHub API 호출 (PR 생성 흐름)

```
1. GET /repos/{owner}/{repo}/git/ref/heads/{default_branch}
   → 최신 커밋 SHA 가져오기

2. POST /repos/{owner}/{repo}/git/refs
   → 새 브랜치 생성 (post/slug-타임스탬프)

3. PUT /repos/{owner}/{repo}/contents/content/posts/{slug}.mdx
   → MDX 파일 커밋 (Base64 인코딩)

4. POST /repos/{owner}/{repo}/pulls
   → PR 생성 (제목, 본문, base: main, head: 새 브랜치)
```

모든 API 호출은 Next.js Route Handler를 통해 서버사이드에서 실행.

---

## 4. 구현 범위

### In Scope

| 기능 | 설명 |
|------|------|
| GitHub OAuth 로그인 | 로그인/로그아웃, 세션 관리 |
| 글쓰기 페이지 | frontmatter 폼 + 마크다운 에디터 |
| 실시간 미리보기 | 마크다운 → HTML 렌더링 |
| PR 자동 생성 | 브랜치 생성 → 파일 커밋 → PR 생성 |
| 환경변수 분리 | `.env`로 모든 설정값 외부화 |

### Out of Scope

- 이미지 업로드 (첫 버전에서는 URL 참조만)
- 글 수정 (기존 글 편집)
- PR 상태 확인 / 머지 기능
- GitHub App 방식 (OAuth App으로 충분)
- 권한 관리 / 관리자 기능

---

## 5. 파일 구조

```
app/
  write/
    page.tsx                    ← 글쓰기 페이지 (에디터 + 미리보기)
  api/
    auth/
      github/
        route.ts                ← GitHub OAuth 시작 (리다이렉트)
        callback/
          route.ts              ← OAuth callback (토큰 교환)
      logout/
        route.ts                ← 로그아웃 (쿠키 삭제)
      me/
        route.ts                ← 현재 로그인 사용자 정보
    posts/
      submit/
        route.ts                ← PR 생성 API

components/
  editor/
    MarkdownEditor.tsx          ← 마크다운 에디터 컴포넌트
    FrontmatterForm.tsx         ← frontmatter 입력 폼
    PostPreview.tsx             ← 실시간 미리보기
    WriteButton.tsx             ← Navbar용 "글쓰기" 버튼

lib/
  github.ts                     ← GitHub API 헬퍼 함수들
  auth.ts                       ← OAuth 토큰 관리 유틸

.env.example                    ← 환경변수 예시 파일
```

---

## 6. 핵심 설계 결정

| 결정 | 이유 |
|------|------|
| GitHub OAuth App (GitHub App 아님) | 개인 토큰 기반으로 PR 생성 — 설정이 간단하고 "누가 작성했는지" 명확 |
| httpOnly 쿠키로 토큰 저장 | localStorage보다 XSS에 안전 |
| Route Handler로 API 프록시 | client_secret 보호 + CORS 문제 없음 |
| 마크다운 에디터는 textarea 기반 | 외부 에디터 라이브러리 최소화, 나중에 교체 가능 |
| `.env`로 repo 정보 분리 | 다른 리포지토리로 쉽게 이전 가능 |

---

## 7. 구현 순서

| Phase | 작업 | 의존성 |
|-------|------|--------|
| 1 | `.env.example` + `lib/github.ts` + `lib/auth.ts` | 없음 |
| 2 | OAuth API routes (login, callback, logout, me) | Phase 1 |
| 3 | `FrontmatterForm.tsx` + `MarkdownEditor.tsx` + `PostPreview.tsx` | 없음 |
| 4 | `app/write/page.tsx` (에디터 페이지 조립) | Phase 2, 3 |
| 5 | `app/api/posts/submit/route.ts` (PR 생성 API) | Phase 1 |
| 6 | `WriteButton.tsx` → Navbar에 추가 | Phase 2 |
| 7 | 전체 흐름 테스트 | 전체 |

---

## 8. 필요한 패키지

| 패키지 | 용도 | 필수 여부 |
|--------|------|-----------|
| 없음 (fetch API 사용) | GitHub API 호출 | - |
| `react-markdown` (선택) | 미리보기 렌더링 | 선택 |

> GitHub API 호출은 Next.js 내장 `fetch`로 충분. 미리보기는 간단한 마크다운 파서면 됨.

---

## 9. 환경변수 설정 가이드

### GitHub OAuth App 생성 방법
1. GitHub → Settings → Developer settings → OAuth Apps → New
2. **Application name**: Hecto Tech Blog Editor
3. **Homepage URL**: `http://localhost:3000` (개발) / 실제 도메인 (프로덕션)
4. **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
5. 생성 후 Client ID / Client Secret 복사 → `.env`에 입력

---

## 10. 리스크

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| OAuth App 생성 권한 없음 | 중 | 높음 | 조직 관리자에게 요청, 또는 개인 계정으로 테스트 |
| GitHub API rate limit | 낮음 | 낮음 | OAuth 토큰 사용 시 5,000 req/hr로 충분 |
| 토큰 만료/탈취 | 낮음 | 중 | httpOnly 쿠키 + 로그아웃 기능 |
| 현재 repo에서 동작 안 함 | 확정 | 없음 | `.env`로 분리했으므로 repo 이전 시 값만 변경 |
