import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { getPosts, getTags } from './get-posts'

export const metadata = {
  title: 'Posts'
}

export default async function PostsPage() {
  const tags = await getTags()
  const posts = await getPosts()
  const allTags: Record<string, number> = Object.create(null)

  for (const tag of tags) {
    allTags[tag] ??= 0
    allTags[tag] += 1
  }

  return (
    <div>
      <h1 className="mt-0">Posts</h1>
      <div className="flex flex-wrap gap-2 mb-8">
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
      {posts.map(post => (
        <PostCard key={post.route} post={post} />
      ))}
    </div>
  )
}
