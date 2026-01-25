import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '@/mdx-components'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tech.hectofinancial.com'

type Props = {
  params: Promise<{ mdxPath: string[] }>
}

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  const meta = metadata as Record<string, unknown>

  const title = (meta?.title as string) || ''
  const description = (meta?.description as string) || ''
  const date = (meta?.date as string) || ''
  const tags = (meta?.tags as string[]) || []
  const slug = params.mdxPath.join('/')
  const url = `${SITE_URL}/${slug}`

  return {
    title,
    description,
    keywords: tags,
    openGraph: {
      type: 'article',
      locale: 'ko_KR',
      url,
      title,
      description,
      siteName: '헥토파이낸셜 기술 블로그',
      publishedTime: date,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function Page(props: Props) {
  const params = await props.params
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode
  } = await importPage(params.mdxPath)

  const Wrapper = getMDXComponents().wrapper

  if (!Wrapper) {
    return <MDXContent {...props} params={params} />
  }

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
