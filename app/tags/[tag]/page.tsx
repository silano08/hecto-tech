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
    title: `Posts Tagged with "${decodeURIComponent(params.tag)}"`
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

  const { title } = await generateMetadata(props)
  const allPosts = await getPosts()
  const filteredPosts = allPosts.filter(post =>
    post.frontMatter.tags.includes(decodeURIComponent(params.tag))
  )

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const posts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  return (
    <>
      <h1>{title}</h1>
      {posts.map(post => (
        <PostCard key={post.route} post={post} />
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/tags/${params.tag}`}
      />
    </>
  )
}