import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'
import type { Category, PostFrontMatter } from '@/types/post'
import { calculateReadingTime } from './reading-time'

export interface Post {
  route: string
  name: string
  title?: string
  frontMatter: PostFrontMatter
  readingTime?: number
}

export function getAuthors(frontMatter: PostFrontMatter): string[] {
  if (frontMatter.authors && frontMatter.authors.length > 0) {
    return frontMatter.authors
  }
  if (frontMatter.author) {
    return [frontMatter.author]
  }
  return []
}

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

export async function getTags(): Promise<string[]> {
  const posts = await getPosts()
  const tags = posts.flatMap(post => post.frontMatter?.tags || [])
  return [...new Set(tags)]
}

export async function getCategories(): Promise<Category[]> {
  return ['전체', 'AI', '인프라', '보안', '개발']
}

export async function getPostsByCategory(category: Category): Promise<Post[]> {
  const posts = await getPosts()
  if (category === '전체') return posts
  return posts.filter(post => post.frontMatter?.category === category)
}

export async function searchPosts(query: string): Promise<Post[]> {
  const posts = await getPosts()
  if (!query.trim()) return posts

  const lowerQuery = query.toLowerCase()
  return posts.filter(post => {
    const title = post.frontMatter?.title?.toLowerCase() || ''
    const description = post.frontMatter?.description?.toLowerCase() || ''
    const tags = post.frontMatter?.tags?.map(t => t.toLowerCase()) || []

    return (
      title.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      tags.some(tag => tag.includes(lowerQuery))
    )
  })
}

export async function filterPosts(options: {
  query?: string
  category?: Category
}): Promise<Post[]> {
  let posts = await getPosts()

  if (options.category && options.category !== '전체') {
    posts = posts.filter(post => post.frontMatter?.category === options.category)
  }

  if (options.query?.trim()) {
    const lowerQuery = options.query.toLowerCase()
    posts = posts.filter(post => {
      const title = post.frontMatter?.title?.toLowerCase() || ''
      const description = post.frontMatter?.description?.toLowerCase() || ''
      const tags = post.frontMatter?.tags?.map(t => t.toLowerCase()) || []

      return (
        title.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        tags.some(tag => tag.includes(lowerQuery))
      )
    })
  }

  return posts
}
