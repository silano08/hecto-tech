# 헥토파이낸셜 기술 블로그 기여 가이드

## 빠른 시작

```bash
# 1. 리포지토리 클론
git clone <repository-url>
cd hecto-tech

# 2. 의존성 설치
pnpm install

# 3. 개발 서버 실행
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속하여 미리보기 가능합니다.

## 글 작성 방법

### 1. 파일 생성

`content/posts/` 디렉토리에 `.mdx` 파일을 생성합니다.

- **파일명 규칙**: 영문 소문자와 하이픈 사용 (예: `spring-boot-outbox-pattern.mdx`)
- 파일명이 URL slug가 됩니다 → `/posts/spring-boot-outbox-pattern`

### 2. Frontmatter 작성

파일 상단에 다음 메타데이터를 작성합니다:

```yaml
---
title: "Spring Boot Outbox Pattern 적용기"
description: "이벤트 일관성을 보장하기 위해 Outbox Pattern을 적용한 경험을 공유합니다"
date: "2026-03-16"
tags:
  - Spring
  - Architecture
  - MSA
author: your-github-id
authors:
  - your-github-id
category: 개발
draft: false
---
```

### Frontmatter 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `title` | string | O | 글 제목 |
| `description` | string | O | 요약 (카드, 검색, SEO에 표시) |
| `date` | string | O | 작성일 (`YYYY-MM-DD` 형식) |
| `tags` | string[] | O | 태그 배열 |
| `author` | string | O | 작성자 (GitHub ID) |
| `authors` | string[] | O | 작성자 배열 (공동 작성 시) |
| `category` | string | O | `AI`, `인프라`, `보안`, `개발` 중 하나 |
| `draft` | boolean | - | `true`면 프로덕션에서 숨김 (기본: `false`) |
| `thumbnail` | string | - | 썸네일 이미지 경로 |
| `reviewer` | string | - | 검수자 |
| `contributors` | string[] | - | 기여자 목록 |

> `author`와 `authors` 중 하나만 작성해도 됩니다. 공동 작성의 경우 `authors` 배열을 사용하세요.

### 3. 본문 작성

마크다운과 MDX를 모두 지원합니다.

#### 코드 블록

언어를 명시하면 구문 강조가 적용됩니다:

````markdown
```typescript
function example(): string {
  return "Hello";
}
```
````

#### 이미지

`public/images/` 폴더에 이미지를 저장한 후 참조합니다:

```markdown
![이미지 설명](/images/my-diagram.png)
```

#### 그 외 지원 문법

- 표 (table)
- 인용문 (blockquote)
- 순서/비순서 리스트
- 굵은 글씨, 기울임, 취소선
- 인라인 코드

> 템플릿 파일 `TEMPLATE.mdx`를 복사하여 시작하면 편리합니다.

### 4. 로컬 미리보기

```bash
pnpm dev
```

- `draft: true` 글도 로컬 개발 서버에서는 보입니다
- 프로덕션 빌드 확인이 필요하면 `pnpm build && pnpm start`

## PR 제출 프로세스

### 1. Feature Branch 생성

```bash
git checkout -b post/your-post-name
```

### 2. 글 작성 및 로컬 확인

- `content/posts/` 에 MDX 파일 작성
- `pnpm dev`로 미리보기 확인
- 이미지가 있다면 `public/images/`에 추가

### 3. draft 설정 확인

발행 준비가 되면 frontmatter에서 `draft: false`로 설정합니다.

### 4. PR 생성

- `blog-post` PR 템플릿을 사용합니다
- 체크리스트를 확인합니다
- 가능하면 로컬 미리보기 스크린샷을 첨부합니다

### 5. 리뷰 및 머지

- 리뷰어의 피드백을 반영합니다
- 머지 후 자동으로 배포됩니다

## 자주 묻는 질문

**Q: MDX에서 React 컴포넌트를 사용할 수 있나요?**
A: 네, MDX는 JSX를 지원합니다. 다만 `content/posts/` 디렉토리 내에서 import하여 사용합니다.

**Q: 이미지 크기 제한이 있나요?**
A: 특별한 제한은 없지만, 웹 최적화를 위해 1MB 이하를 권장합니다.

**Q: draft 글은 다른 사람이 볼 수 있나요?**
A: `draft: true` 글은 프로덕션 사이트에 표시되지 않습니다. 로컬 개발 서버에서만 확인 가능합니다.

**Q: 태그는 자유롭게 추가할 수 있나요?**
A: 네, 기존 태그를 재사용하거나 새로운 태그를 추가할 수 있습니다.
