# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

pnpm 사용 (npm 사용 금지)

## Import Convention

상대경로 대신 `@/` alias 사용
- `@/components/*` - 컴포넌트
- `@/lib/*` - 유틸리티

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome
pnpm add <pkg>    # Install package
```

## Architecture

This is Hecto Financial's tech blog built with Next.js 16 + Nextra 4 + Tailwind CSS 4.

### Content Flow

MDX content in `content/` → Nextra processes with Shiki highlighting → `mdx-components.tsx` wraps with `ArticleLayout` → rendered via `app/[...mdxPath]/page.tsx`

### Key Files

- `next.config.ts` - Nextra config with rehype-pretty-code (Shiki github-dark theme)
- `mdx-components.tsx` - MDX wrapper using ArticleLayout
- `app/globals.css` - Custom theme with @layer base, colors: primary (#ff6114), black, white
- `lib/get-posts.ts` - Post fetching utilities using Nextra's normalizePages/getPageMap

### Components

- `ArticleLayout` - Article wrapper with ToC sidebar, recruitment banner, Giscus comments
- `Toc` - Sticky sidebar table of contents with scroll spy (client component)
- `PostCard` - Post list item card
- `Comments` - Giscus integration (client component)
- `Navbar` / `Footer` - Site header and footer

### Routes

- `/` - Homepage with post list (`app/page.tsx`)
- `/tags/[tag]` - Posts filtered by tag
- `/[...mdxPath]` - Catch-all for MDX content

### Content Structure

```
content/
└── posts/
    └── *.mdx       # Blog posts with frontmatter (title, description, date, tags)
```

### Styling

Uses Tailwind CSS 4 with custom CSS variables in `@layer base`. Theme colors defined in `:root` with dark mode via `prefers-color-scheme`.
