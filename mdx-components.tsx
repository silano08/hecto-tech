import type { MDXComponents } from 'mdx/types'
import ArticleLayout from '@/components/ArticleLayout'
import CodeBlock from '@/components/CodeBlock'

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...components,
    wrapper: ArticleLayout,
    pre: CodeBlock,
  }
}
