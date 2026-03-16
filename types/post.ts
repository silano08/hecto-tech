export type Category = '전체' | 'AI' | '인프라' | '보안' | '개발'

export const CATEGORIES: Category[] = ['전체', 'AI', '인프라', '보안', '개발']

export interface PostFrontMatter {
  title?: string
  description?: string
  date?: string
  tags?: string[]
  author?: string
  authors?: string[]
  reviewer?: string
  contributors?: string[]
  thumbnail?: string
  category?: Category
  draft?: boolean
}
