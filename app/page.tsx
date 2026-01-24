import { Suspense } from 'react'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import SearchBar from '@/components/SearchBar'
import CategoryTabs from '@/components/CategoryTabs'
import { filterPosts } from '@/lib/get-posts'
import type { Category } from '@/types/post'

const POSTS_PER_PAGE = 10

type Props = {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { page, q, category } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))
  const currentCategory = (category as Category) || '전체'

  const allPosts = await filterPosts({
    query: q,
    category: currentCategory
  })

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

      {/* 검색 + 카테고리 */}
      <section className="mb-8 space-y-4">
        <Suspense fallback={<div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />}>
          <SearchBar />
        </Suspense>
        <Suspense fallback={<div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-full w-80 animate-pulse" />}>
          <CategoryTabs currentCategory={currentCategory} />
        </Suspense>
      </section>

      {/* 검색 결과 정보 */}
      {(q || currentCategory !== '전체') && (
        <section className="mb-6">
          <p className="text-sm text-muted">
            {q && <span>"{q}" 검색 결과</span>}
            {q && currentCategory !== '전체' && <span> · </span>}
            {currentCategory !== '전체' && <span>{currentCategory} 카테고리</span>}
            <span className="ml-2">({allPosts.length}개의 글)</span>
          </p>
        </section>
      )}

      <section>
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.route} post={post} />
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted text-lg">검색 결과가 없습니다.</p>
            <p className="text-muted text-sm mt-2">다른 검색어나 카테고리를 시도해보세요.</p>
          </div>
        )}
      </section>

      <Suspense fallback={null}>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
