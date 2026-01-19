import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { getPosts, getTags } from './posts/get-posts'

export default async function HomePage() {
  const tags = await getTags()
  const posts = await getPosts()
  const allTags: Record<string, number> = Object.create(null)

  for (const tag of tags) {
    allTags[tag] ??= 0
    allTags[tag] += 1
  }

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-5xl mt-0 mb-2">
          <span className="text-primary">Hecto Financial</span> <span className="text-black dark:text-white">Tech Blog</span>
        </h1>
        <p className="text-muted text-lg">
          헥토파이낸셜 개발팀의 기술 블로그입니다.
        </p>
      </section>

      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          {Object.entries(allTags).map(([tag, count]) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="bg-gray-100 dark:bg-gray-800 text-foreground px-3 py-1 rounded-full text-sm"
            >
              {tag} ({count})
            </Link>
          ))}
        </div>
      </section>

      <section>
        {posts.map(post => (
          <PostCard key={post.route} post={post} />
        ))}
      </section>
    </div>
  )
}
