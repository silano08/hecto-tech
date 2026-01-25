import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'
import type { Category } from '@/types/post'

export interface Post {
  route: string
  name: string
  title?: string
  frontMatter: {
    title?: string
    description?: string
    date?: string
    tags?: string[]
    authors?: string[]
    reviewer?: string
    contributors?: string[]
    thumbnail?: string
    category?: Category
  }
}

export async function getPosts(): Promise<Post[]> {
  const { directories } = normalizePages({
    list: await getPageMap('/posts'),
    route: '/posts'
  })
  return directories
    .filter(post => post.name !== 'index')
    .sort((a, b) => {
      const dateA = a.frontMatter?.date ? new Date(a.frontMatter.date).getTime() : 0
      const dateB = b.frontMatter?.date ? new Date(b.frontMatter.date).getTime() : 0
      return dateB - dateA
    }) as Post[]
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
