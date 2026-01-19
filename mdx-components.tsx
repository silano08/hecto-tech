import type { MDXComponents } from 'mdx/types'
import ArticleLayout from '@/components/ArticleLayout'

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...components,
    wrapper: ArticleLayout,
  }
}
