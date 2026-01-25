import { Suspense } from 'react'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import { getPosts, getTags } from '@/lib/get-posts'

const POSTS_PER_PAGE = 10

type Props = {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata(props: Props) {
  const params = await props.params
  return {
    title: `"${decodeURIComponent(params.tag)}" 태그 글 목록`
  }
}

export async function generateStaticParams() {
  const allTags = await getTags()
  return [...new Set(allTags)].map(tag => ({ tag }))
}

export default async function TagPage(props: Props) {
  const params = await props.params
  const { page } = await props.searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))

  const tag = decodeURIComponent(params.tag)
  const allPosts = await getPosts()
  const filteredPosts = allPosts.filter(post =>
    post.frontMatter?.tags?.includes(tag)
  )

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const posts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  return (
    <>
      <h1>#{tag} 태그 글 목록</h1>
      {posts.map(post => (
        <PostCard key={post.route} post={post} />
      ))}
      <Suspense fallback={null}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/tags/${params.tag}`}
        />
      </Suspense>
    </>
  )
}
