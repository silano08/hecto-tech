# Plan: PR-Based Static Tech Blog System

> **Feature**: pr-based-blog-system
> **Created**: 2026-03-16
> **Status**: Draft
> **Priority**: High

---

## 1. Background & Problem Statement

Hecto Financial needs a developer-friendly internal tech blog where:
- Developers contribute posts via GitHub Pull Requests
- No backend service exists or should be created
- Content is Git-based, leveraging the existing Next.js + Nextra setup
- Posts go live automatically when PRs are merged to `main`

### Current State Analysis

The project **already has a mature foundation** built with Next.js 16 + Nextra 4 + Tailwind CSS 4:

| Feature | Status | Location |
|---------|--------|----------|
| MDX content system | **Exists** | `content/posts/*.mdx` via Nextra |
| Blog list page | **Exists** | `app/page.tsx` with search, categories, pagination |
| Individual post pages | **Exists** | `app/[...mdxPath]/page.tsx` with SEO metadata |
| Tag filtering | **Exists** | `app/tags/[tag]/page.tsx` |
| Table of contents | **Exists** | `components/Toc.tsx`, `components/TopToc.tsx` |
| Syntax highlighting | **Exists** | rehype-pretty-code with Shiki `github-dark` theme |
| SEO metadata | **Exists** | OpenGraph, Twitter cards, canonical URLs, RSS |
| Post template | **Exists** | `TEMPLATE.mdx` |
| Comments | **Exists** | Giscus integration |
| Dark mode | **Exists** | next-themes with system detection |
| Search | **Exists** | `components/SearchBar.tsx` + `lib/get-posts.ts` |
| Category tabs | **Exists** | `components/CategoryTabs.tsx` |
| Code copy button | **Exists** | `components/CopyButton.tsx` |
| Related posts | **Exists** | `components/RelatedPosts.tsx` |
| Share buttons | **Exists** | `components/ShareButtons.tsx` |
| Post navigation | **Exists** | `components/PostNavigation.tsx` |

### Gaps Identified

| Feature | Status | Details |
|---------|--------|---------|
| `draft` field support | **Missing** | No filtering of draft posts |
| `author` field (singular) | **Partial** | Currently `authors` array, needs `author` alias |
| Reading time estimation | **Missing** | Not implemented |
| PR template | **Missing** | No `.github/` directory |
| Contributor documentation | **Missing** | No `CONTRIBUTING.md` or blog writing guide |
| Automatic slug from filename | **Exists** | Nextra handles this via filename |
| Content directory naming | **Mismatch** | Requirements say `/posts`, actual is `content/posts/` |

---

## 2. Goals & Success Criteria

### Goals
1. Add `draft` post support to prevent WIP posts from appearing in production
2. Add reading time estimation to post metadata and UI
3. Create GitHub PR template specifically for blog post submissions
4. Create comprehensive contributor documentation
5. Standardize frontmatter schema (support both `author` and `authors`)

### Success Criteria
- [ ] Draft posts are excluded from blog list and tag pages in production
- [ ] Each post displays estimated reading time
- [ ] PR template guides developers through blog post submission
- [ ] Contributor docs explain the full workflow from writing to publishing
- [ ] Existing posts and functionality remain unbroken

---

## 3. Scope

### In Scope
1. **Draft filtering** - Add `draft: true/false` frontmatter field, filter draft posts in production builds
2. **Reading time** - Calculate from MDX source content, display in PostCard and ArticleLayout
3. **PR template** - `.github/PULL_REQUEST_TEMPLATE/blog-post.md`
4. **Contributor docs** - `CONTRIBUTING.md` with blog writing guide
5. **Frontmatter schema update** - Support `author` field alongside existing `authors`
6. **TEMPLATE.mdx update** - Add `draft` field and `author` field to template

### Out of Scope
- Backend service (constraint: no backend)
- CMS or admin panel
- Content directory restructuring (`content/posts/` stays as-is, works well with Nextra)
- UI redesign (existing UI is already modern and functional)
- CI/CD pipeline (deploy-on-merge already works with standard Next.js hosting)
- Image optimization pipeline
- Comment moderation system

---

## 4. Technical Approach

### 4.1 Draft Post Support

**Approach**: Filter at the data layer in `lib/get-posts.ts`

```
getPosts() → filter where draft !== true (in production)
           → show all posts (in development for preview)
```

- Add `draft?: boolean` to `Post.frontMatter` interface
- In `getPosts()`, check `process.env.NODE_ENV` to determine filtering
- Draft posts visible in `pnpm dev`, hidden in `pnpm build` output

### 4.2 Reading Time Estimation

**Approach**: Calculate from MDX source using Nextra's `sourceCode` prop

```
sourceCode → strip MDX/JSX → count words → divide by 200 wpm → round up
```

- Create utility function `calculateReadingTime(sourceCode: string): number`
- Display in `PostCard` component (list view)
- Display in `ArticleLayout` component (post view)
- For list view: compute at `getPosts()` level or pass through frontMatter enrichment

**Alternative considered**: Use a rehype/remark plugin. Rejected because Nextra already passes `sourceCode` to the wrapper, making manual calculation simpler and more maintainable.

### 4.3 PR Template

**File**: `.github/PULL_REQUEST_TEMPLATE/blog-post.md`

Contents:
- Checklist for frontmatter completeness
- Preview instructions
- Formatting rules reminder
- Review request guidance

### 4.4 Contributor Documentation

**File**: `CONTRIBUTING.md`

Sections:
1. Quick start (fork, write, PR)
2. Frontmatter reference
3. Content guidelines (Markdown/MDX features)
4. Image handling
5. Local preview instructions
6. PR submission process
7. Review process

### 4.5 Frontmatter Schema

Current: `authors: string[]`
Addition: Support `author: string` as an alias

In `lib/get-posts.ts`, normalize frontmatter to always use `authors` internally:
```
author: "Name" → authors: ["Name"]
authors: ["Name1", "Name2"] → authors: ["Name1", "Name2"]
```

---

## 5. Implementation Order

| Phase | Task | Estimated Effort | Dependencies |
|-------|------|-----------------|--------------|
| 1 | Update `Post` interface + `TEMPLATE.mdx` | Small | None |
| 2 | Implement draft filtering in `lib/get-posts.ts` | Small | Phase 1 |
| 3 | Implement reading time utility | Small | None |
| 4 | Integrate reading time into PostCard + ArticleLayout | Small | Phase 3 |
| 5 | Create `.github/PULL_REQUEST_TEMPLATE/blog-post.md` | Small | None |
| 6 | Create `CONTRIBUTING.md` | Medium | Phase 1-4 complete |
| 7 | Test full workflow end-to-end | Small | All phases |

**Total estimated effort**: Small-to-medium. All changes are additive to an already functioning system.

---

## 6. Dependencies

### Existing (no changes needed)
- `next@16.1.3`
- `nextra@^4.6.1`
- `react@19.2.3`
- `tailwindcss@^4`

### New packages required
- **None**. All features can be implemented with existing dependencies.

---

## 7. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Draft filtering breaks existing posts without `draft` field | Low | Medium | Treat missing `draft` as `false` (published) |
| Reading time calculation inaccurate for code-heavy posts | Low | Low | Use adjusted WPM for code blocks, accept minor variance |
| Contributors ignore PR template | Medium | Low | Make template clear and minimal; add CI check reminder |
| Nextra `sourceCode` unavailable in list view | Medium | Medium | Fallback: use content length estimation or add at build time |

---

## 8. Files to Modify/Create

### Modify
- `lib/get-posts.ts` - Add draft filtering, author normalization, reading time
- `types/post.ts` - Add `draft`, `author` to type
- `components/PostCard.tsx` - Display reading time
- `components/ArticleLayout.tsx` - Display reading time
- `TEMPLATE.mdx` - Add `draft` and `author` fields

### Create
- `lib/reading-time.ts` - Reading time calculation utility
- `.github/PULL_REQUEST_TEMPLATE/blog-post.md` - PR template
- `CONTRIBUTING.md` - Contributor documentation

---

## 9. Decision Log

| Decision | Rationale |
|----------|-----------|
| Keep `content/posts/` directory (not rename to `/posts`) | Nextra conventions expect `content/` directory; renaming would break the existing Nextra integration |
| No new dependencies | Reading time and draft filtering are trivial to implement; adding libraries would be over-engineering |
| Filter drafts at data layer, not build layer | Simpler implementation; allows dev preview of drafts |
| Use `sourceCode` for reading time, not remark plugin | Nextra already provides `sourceCode`; avoid plugin complexity |
| Support both `author` and `authors` | Backward compatibility with existing posts using `authors` array |
