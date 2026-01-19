import { Fragment } from 'react'
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

  const title = metadata?.title as string || ''
  const description = metadata?.description as string || ''
  const date = metadata?.date as string || ''
  const tags = metadata?.tags as string[] || []
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
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: url,
    },
  }
}
 
const Wrapper = getMDXComponents().wrapper ?? Fragment
 
export default async function Page(props: Props) {
  const params = await props.params
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode
  } = await importPage(params.mdxPath)
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}