import { useMDXComponents as getThemeComponents } from 'nextra-theme-blog'
import { MDXComponents } from 'nextra/mdx-components'
import ArticleLayout from '@/components/ArticleLayout'

const themeComponents = getThemeComponents()

export function useMDXComponents(components?: MDXComponents) {
  return {
    ...themeComponents,
    ...components,
  }
}