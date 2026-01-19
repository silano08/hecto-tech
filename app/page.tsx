import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import { getPosts } from '@/lib/get-posts'

const POSTS_PER_PAGE = 10

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))

  const allPosts = await getPosts()

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
  const posts = allPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  return (
    <div>
      <section className="mb-8 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-5xl mt-0 mb-2">
          <span className="text-primary">Hecto Financial</span> <span className="text-black dark:text-white">Tech Blog</span>
        </h1>
        <p className="text-muted text-base lg:text-lg">
          헥토파이낸셜 개발팀의 기술 블로그입니다.
        </p>
      </section>

      <section>
        {posts.map(post => (
          <PostCard key={post.route} post={post} />
        ))}
      </section>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
