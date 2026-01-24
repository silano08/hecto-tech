import { Suspense } from 'react'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import SearchBar from '@/components/SearchBar'
import CategoryTabs from '@/components/CategoryTabs'
import HeroBanner from '@/components/HeroBanner'
import SearchResultsInfo from '@/components/SearchResultsInfo'
import EmptyState from '@/components/EmptyState'
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
      <HeroBanner />

      {/* 검색 + 카테고리 */}
      <section className="mb-8 space-y-4">
        <Suspense fallback={<div className="h-11 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />}>
          <SearchBar />
        </Suspense>
        <Suspense fallback={<div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-full w-80 animate-pulse" />}>
          <CategoryTabs currentCategory={currentCategory} />
        </Suspense>
      </section>

      <SearchResultsInfo query={q} category={currentCategory} totalPosts={allPosts.length} />

      <section>
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.route} post={post} />
          ))
        ) : (
          <EmptyState />
        )}
      </section>

      <Suspense fallback={null}>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
