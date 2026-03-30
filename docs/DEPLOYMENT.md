# Vercel 배포 가이드

## 1. Vercel 프로젝트 연결

### 방법 A: Vercel 대시보드 (추천)

1. https://vercel.com/new 접속
2. **Import Git Repository** → `silano08/hecto-tech` 선택
3. Framework Preset: **Next.js** (자동 감지됨)
4. **Environment Variables** 섹션에서 아래 환경변수 입력
5. **Deploy** 클릭

### 방법 B: CLI

```bash
vercel login
vercel link          # 프로젝트 연결
vercel env pull      # 환경변수 동기화 (대시보드에서 먼저 설정)
vercel deploy        # 프리뷰 배포
vercel --prod        # 프로덕션 배포
```

## 2. 환경변수 설정

Vercel 대시보드 → Settings → Environment Variables 에서 입력:

### 필수

| 변수 | 값 | 설명 |
|------|-----|------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` | 배포 후 실제 URL로 변경 |

### 웹 에디터 (글쓰기 기능)

| 변수 | 값 | 설명 |
|------|-----|------|
| `GITHUB_CLIENT_ID` | OAuth App에서 발급 | [발급 방법 →](#3-github-oauth-app-설정) |
| `GITHUB_CLIENT_SECRET` | OAuth App에서 발급 | 위와 동일 |
| `GITHUB_OWNER` | `silano08` | 대상 리포 소유자 |
| `GITHUB_REPO` | `hecto-tech` | 대상 리포 이름 |
| `GITHUB_DEFAULT_BRANCH` | `main` | 기본 브랜치 |
| `ALLOWED_BLOG_AUTHORS` | `silano08` (선택) | 비워두면 모든 GitHub 유저 허용 |

### 댓글 (Giscus)

| 변수 | 값 | 설명 |
|------|-----|------|
| `NEXT_PUBLIC_GISCUS_REPO` | `silano08/hecto-tech` | 리포지토리 |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | GraphQL로 조회 | [조회 방법 →](#4-giscus-설정) |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | GraphQL로 조회 | 위와 동일 |

## 3. GitHub OAuth App 설정

### 생성

1. https://github.com/settings/applications/new 접속
2. 입력:

| 필드 | 값 |
|------|-----|
| Application name | `Hecto Tech Blog Editor` |
| Homepage URL | `https://your-project.vercel.app` |
| Authorization callback URL | `https://your-project.vercel.app/api/auth/github/callback` |

3. **Register application** 클릭
4. Client ID 복사 → `GITHUB_CLIENT_ID`
5. **Generate a new client secret** 클릭 → 복사 → `GITHUB_CLIENT_SECRET`

### 주의

- 배포 URL이 확정된 후에 OAuth App의 callback URL을 실제 URL로 업데이트해야 함
- 커스텀 도메인을 쓰면 그 도메인으로 설정

## 4. Giscus 설정

### Giscus App 설치

1. https://github.com/apps/giscus 접속
2. 대상 리포지토리에 설치

### Discussion 활성화

1. 리포지토리 Settings → Features → **Discussions** 체크

### ID 조회

```bash
gh api graphql -f query='{
  repository(owner: "silano08", name: "hecto-tech") {
    id
    discussionCategories(first: 10) {
      nodes { id, name }
    }
  }
}'
```

결과에서:
- `data.repository.id` → `NEXT_PUBLIC_GISCUS_REPO_ID`
- `nodes`에서 `Announcements`의 `id` → `NEXT_PUBLIC_GISCUS_CATEGORY_ID`

## 5. 자동 배포

Vercel에 GitHub 리포를 연결하면:

```
main에 push/머지 → Vercel이 자동 빌드 + 배포
PR 생성 → Preview 배포 (PR마다 고유 URL)
```

별도 설정 불필요. 연결만 하면 자동으로 동작.

## 6. 커스텀 도메인 (선택)

1. Vercel 대시보드 → Settings → Domains
2. 도메인 추가 (예: `tech.hectofinancial.com`)
3. DNS에 CNAME 레코드 추가: `cname.vercel-dns.com`
4. 완료되면 `NEXT_PUBLIC_SITE_URL`과 OAuth callback URL 업데이트

## 7. 체크리스트

배포 후 확인:

- [ ] 블로그 홈 (`/`) 글 목록 표시
- [ ] 글 상세 페이지 정상 렌더링
- [ ] 태그 페이지 동작
- [ ] 다크모드 동작
- [ ] "글쓰기" 버튼 → GitHub 로그인 → 에디터 페이지
- [ ] 글 작성 → PR 생성 확인
- [ ] 댓글 (Giscus) 동작
- [ ] OG 이미지, SEO 메타 태그 확인
